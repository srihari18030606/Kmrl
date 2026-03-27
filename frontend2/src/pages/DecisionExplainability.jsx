// src/pages/DecisionExplainability.jsx
import { useState, useEffect } from 'react'
import { getTrains, getDecisionBreakdown } from '../api/api'
import { Spinner, EmptyState } from '../components/ui/index'
import { Brain, ChevronDown } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, CartesianGrid
} from 'recharts'

const MILEAGE_BANDS = [
  { range: '0 – 20,000 km',      factor: 1.00, zone: 'SAFE',     color: '#00e676' },
  { range: '20,000 – 26,000 km', factor: 0.75, zone: 'CAUTION',  color: '#ffd740' },
  { range: '26,000 – 29,000 km', factor: 0.40, zone: 'CRITICAL', color: '#ff6d00' },
  { range: '29,000 – 30,000 km', factor: 0.15, zone: 'DANGER',   color: '#ff1744' },
  { range: '> 30,000 km',        factor: 0.00, zone: 'EXCEED',   color: '#9c0027' },
]

function MileageBandTable({ currentMileage }) {
  return (
    <div className="panel p-4">
      <div className="section-label mb-3">Mileage Factor Reference Bands</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mileage Range</th>
            <th>Factor</th>
            <th>Zone</th>
            <th>Your Train</th>
          </tr>
        </thead>
        <tbody>
          {MILEAGE_BANDS.map((b, i) => (
            <tr key={i}>
              <td><span className="font-mono text-xs">{b.range}</span></td>
              <td><span className="font-mono font-bold" style={{ color: b.color }}>{b.factor.toFixed(2)}</span></td>
              <td>
                <span className="font-display text-xs font-bold tracking-widest" style={{ color: b.color }}>
                  {b.zone}
                </span>
              </td>
              <td>
                {currentMileage !== null && (() => {
                  const m = currentMileage
                  const inBand =
                    i === 0 ? m < 20000 :
                    i === 1 ? m >= 20000 && m < 26000 :
                    i === 2 ? m >= 26000 && m < 29000 :
                    i === 3 ? m >= 29000 && m < 30000 :
                              m >= 30000
                  return inBand
                    ? <span className="font-mono text-xs" style={{ color: b.color }}>◀ {currentMileage.toLocaleString()} km</span>
                    : null
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0]
    return (
      <div className="panel px-3 py-2 border border-depot-border">
        <div className="font-mono text-xs" style={{ color: 'var(--depot-white)' }}>{d.name}</div>
        <div className="font-mono text-sm font-bold" style={{ color: d.fill }}>
          {typeof d.value === 'number' ? d.value.toFixed(3) : d.value}
        </div>
      </div>
    )
  }
  return null
}

export default function DecisionExplainability() {
  const [trains, setTrains]       = useState([])
  const [selected, setSelected]   = useState('')
  const [breakdown, setBreakdown] = useState(null)
  const [trainData, setTrainData] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)

  useEffect(() => {
    getTrains().then(t => {
      setTrains(t)
      if (t.length > 0) setSelected(t[0].name)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getDecisionBreakdown(selected)
      .then(data => {
        setBreakdown(data)
        const train = trains.find(t => t.name === selected)
        setTrainData(train || null)
      })
      .catch(() => setBreakdown(null))
      .finally(() => setLoading(false))
  }, [selected, trains])

  // Compute score same as backend: score * (1 - ai_risk)
  const aiRisk = breakdown?.ai_risk ?? 0
  const rawScore = breakdown
    ? (breakdown.mileage_factor * 0.55) + (breakdown.branding_active ? 0.45 : 0) - breakdown.cleanliness_penalty
    : 0
  const computedScore = breakdown
    ? Math.max(0, Math.min(1, rawScore * (1 - aiRisk)))
    : null

  const barData = breakdown ? [
    {
      name: 'Mileage Factor',
      value: breakdown.mileage_factor,
      fill: breakdown.mileage_factor >= 0.75 ? '#00e676' : breakdown.mileage_factor >= 0.4 ? '#ffd740' : '#ff1744',
    },
    {
      name: 'Branding Factor',
      value: breakdown.branding_active ? 0.45 : 0,
      fill: breakdown.branding_active ? '#00c2ff' : '#243044',
    },
    {
      name: 'Cleanliness Penalty',
      value: -breakdown.cleanliness_penalty,
      fill: breakdown.cleanliness_penalty > 0 ? '#ff6d00' : '#243044',
    },
    {
      name: 'AI Risk Penalty',
      value: -(aiRisk * rawScore),
      fill: aiRisk > 0.5 ? '#ff1744' : aiRisk > 0.2 ? '#ff6d00' : '#64748b',
    },
  ] : []

  const radarData = breakdown ? [
    { subject: 'Mileage',     A: breakdown.mileage_factor * 100 },
    { subject: 'Branding',    A: breakdown.branding_active ? 100 : 0 },
    { subject: 'Cleanliness', A: Math.max(0, (1 - breakdown.cleanliness_penalty / 0.25) * 100) },
    { subject: 'AI Safety',   A: Math.max(0, (1 - aiRisk) * 100) },
    { subject: 'Overall',     A: computedScore !== null ? computedScore * 100 : 0 },
  ] : []

  const aiRiskColor = aiRisk > 0.5 ? '#ff1744' : aiRisk > 0.2 ? '#ff6d00' : '#00e676'
  const aiRiskLabel = aiRisk > 0.5 ? 'HIGH RISK' : aiRisk > 0.2 ? 'MODERATE' : 'LOW RISK'

  return (
    <div className="space-y-4">
      {/* Train selector */}
      <div className="panel p-4">
        <div className="flex items-center gap-3">
          <Brain size={14} className="text-depot-accent" />
          <span className="font-display font-bold text-sm tracking-wide"
            style={{ color: 'var(--depot-white)' }}>
            Select Train for Decision Analysis
          </span>
        </div>
        <div className="mt-3 relative">
          <button
            onClick={() => setDropOpen(o => !o)}
            className="flex items-center justify-between w-full max-w-xs border rounded-sm px-3 py-2 font-mono text-sm hover:border-depot-accent transition-colors"
            style={{
              background: 'var(--depot-bg)',
              borderColor: 'var(--depot-border)',
              color: 'var(--depot-text)',
            }}
          >
            <span>{selected || 'Select a train…'}</span>
            <ChevronDown size={14} style={{ color: 'var(--depot-muted)' }} />
          </button>
          {dropOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 border rounded-sm z-50 shadow-xl max-h-48 overflow-y-auto"
              style={{ background: 'var(--depot-panel)', borderColor: 'var(--depot-border)' }}>
              {trains.map(t => (
                <button
                  key={t.name}
                  onClick={() => { setSelected(t.name); setDropOpen(false) }}
                  className="w-full text-left px-3 py-2 font-mono text-xs transition-colors"
                  style={{
                    color: selected === t.name ? 'var(--depot-accent)' : 'var(--depot-text)',
                    background: selected === t.name ? 'var(--depot-dim)' : 'transparent',
                  }}
                >
                  {t.name}
                  <span className="ml-2" style={{ color: 'var(--depot-muted)' }}>{t.mileage?.toLocaleString()} km</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Spinner size={24} /></div>}
      {!loading && !breakdown && <EmptyState message="No breakdown data" sub="Populate database and select a train" />}

      {!loading && breakdown && (
        <>
          {/* ── Score Cards — now 5 cards ── */}
          <div className="grid grid-cols-5 gap-3">

            {/* Composite Score */}
            <div className="panel p-4 border border-depot-accent/30">
              <div className="section-label mb-1">Composite Score</div>
              <div className={`font-mono text-2xl font-bold ${
                computedScore >= 0.7 ? 'text-depot-green glow-green' :
                computedScore >= 0.4 ? 'text-depot-yellow glow-yellow' :
                'text-depot-red glow-red'
              }`}>
                {computedScore?.toFixed(3)}
              </div>
              <div className="font-display text-xs text-depot-muted mt-1">out of 1.000</div>
            </div>

            {/* Mileage Factor */}
            <div className="panel p-4">
              <div className="section-label mb-1">Mileage Factor</div>
              <div className={`font-mono text-2xl font-bold ${
                breakdown.mileage_factor >= 0.75 ? 'text-depot-green' :
                breakdown.mileage_factor >= 0.4  ? 'text-depot-yellow' : 'text-depot-red'
              }`}>
                {breakdown.mileage_factor.toFixed(2)}
              </div>
              <div className="font-display text-xs text-depot-muted mt-1">
                {trainData ? `${trainData.mileage?.toLocaleString()} km` : '—'}
              </div>
            </div>

            {/* Cleanliness Penalty */}
            <div className="panel p-4">
              <div className="section-label mb-1">Cleanliness Penalty</div>
              <div className={`font-mono text-2xl font-bold ${
                breakdown.cleanliness_penalty === 0 ? 'text-depot-green' :
                breakdown.cleanliness_penalty <= 0.1 ? 'text-depot-yellow' : 'text-depot-red'
              }`}>
                -{breakdown.cleanliness_penalty.toFixed(2)}
              </div>
              <div className="font-display text-xs text-depot-muted mt-1">
                {trainData ? `${trainData.days_since_cleaning} days since clean` : '—'}
              </div>
            </div>

            {/* Branding Active */}
            <div className="panel p-4">
              <div className="section-label mb-1">Branding Active</div>
              <div className={`font-mono text-2xl font-bold ${breakdown.branding_active ? 'text-depot-accent glow-accent' : 'text-depot-muted'}`}>
                {breakdown.branding_active ? 'YES' : 'NO'}
              </div>
              <div className="font-display text-xs text-depot-muted mt-1">
                {breakdown.branding_active ? 'Contract active' : 'No contract'}
              </div>
            </div>

            {/* AI Predicted Failure Risk — NEW */}
            <div className="panel p-4" style={{ borderColor: `${aiRiskColor}44` }}>
              <div className="section-label mb-1">AI Failure Risk</div>
              <div className="font-mono text-2xl font-bold" style={{ color: aiRiskColor }}>
                {(aiRisk * 100).toFixed(1)}%
              </div>
              <div className="font-display text-xs font-bold tracking-widest mt-1" style={{ color: aiRiskColor }}>
                {aiRiskLabel}
              </div>
            </div>

          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="panel p-4">
              <div className="section-label mb-3">Score Component Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="var(--depot-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--depot-muted)', fontSize: 9, fontFamily: 'Barlow Condensed' }}
                    axisLine={{ stroke: 'var(--depot-border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[-0.6, 1]}
                    tick={{ fill: 'var(--depot-muted)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                    axisLine={{ stroke: 'var(--depot-border)' }}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,194,255,0.04)' }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel p-4">
              <div className="section-label mb-3">Multi-Axis Fitness Profile</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--depot-border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'var(--depot-muted)', fontSize: 10, fontFamily: 'Barlow Condensed' }}
                  />
                  <Radar
                    name={selected}
                    dataKey="A"
                    stroke="#00c2ff"
                    fill="#00c2ff"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Formula ── */}
          <div className="panel p-4">
            <div className="section-label mb-3">Scoring Formula Applied</div>
            <div className="flex items-center flex-wrap gap-2 font-mono text-sm">
              <span style={{ color: 'var(--depot-white)' }}>Score =</span>
              <span className="px-2 py-1 rounded-sm border" style={{ borderColor: '#00e67633', background: '#00e67611', color: '#00e676' }}>
                {breakdown.mileage_factor.toFixed(2)} × 0.55
              </span>
              <span style={{ color: 'var(--depot-muted)' }}>+</span>
              <span className="px-2 py-1 rounded-sm border" style={{ borderColor: '#00c2ff33', background: '#00c2ff11', color: '#00c2ff' }}>
                {breakdown.branding_active ? '1.00' : '0.00'} × 0.45
              </span>
              <span style={{ color: 'var(--depot-muted)' }}>−</span>
              <span className="px-2 py-1 rounded-sm border" style={{ borderColor: '#ff6d0033', background: '#ff6d0011', color: '#ff6d00' }}>
                {breakdown.cleanliness_penalty.toFixed(2)}
              </span>
              <span style={{ color: 'var(--depot-muted)' }}>× (1 −</span>
              <span className="px-2 py-1 rounded-sm border" style={{ borderColor: `${aiRiskColor}44`, background: `${aiRiskColor}11`, color: aiRiskColor }}>
                AI {aiRisk.toFixed(3)}
              </span>
              <span style={{ color: 'var(--depot-muted)' }}>)</span>
              <span style={{ color: 'var(--depot-muted)' }}>=</span>
              <span className={`px-3 py-1 rounded-sm border font-bold ${
                computedScore >= 0.7 ? 'text-depot-green border-depot-green/40' :
                computedScore >= 0.4 ? 'text-depot-yellow border-depot-yellow/40' :
                'text-depot-red border-depot-red/40'
              }`}>
                {computedScore?.toFixed(3)}
              </span>
            </div>
            <p className="font-body text-xs mt-3 leading-relaxed" style={{ color: 'var(--depot-muted)' }}>
              Mileage (55%) and branding urgency (45%) form the base score. Cleanliness penalty is subtracted.
              The AI predicted failure risk then multiplies the final score — higher AI risk reduces the composite score,
              deprioritising trains with elevated failure probability.
            </p>
          </div>

          {/* ── Fitness Certificates ── */}
          {trainData && (
            <div className="panel p-4">
              <div className="section-label mb-3">Fitness Certificate Status</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Rolling Stock', valid: trainData.fitness_rs,         expiry: trainData.fitness_rs_expiry_days },
                  { label: 'Signalling',    valid: trainData.fitness_signalling, expiry: trainData.fitness_signalling_expiry_days },
                  { label: 'Telecom',       valid: trainData.fitness_telecom,    expiry: trainData.fitness_telecom_expiry_days },
                ].map(cert => (
                  <div key={cert.label} className="panel p-3" style={{
                    borderColor: cert.valid ? '#00e67633' : '#ff174433',
                    background:  cert.valid ? 'rgba(0,230,118,0.04)' : 'rgba(255,23,68,0.04)'
                  }}>
                    <div className="font-display font-bold text-xs mb-1" style={{ color: 'var(--depot-white)' }}>{cert.label}</div>
                    <div className={`font-mono text-sm font-bold ${cert.valid ? 'text-depot-green' : 'text-depot-red'}`}>
                      {cert.valid ? '✓ VALID' : '✗ INVALID'}
                    </div>
                    {cert.expiry !== null && (
                      <div className="font-mono text-2xs text-depot-muted mt-1">Expires in {cert.expiry} days</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="panel p-3" style={{
                  borderColor: trainData.open_job_card ? '#ff174433' : '#00e67633',
                  background:  trainData.open_job_card ? 'rgba(255,23,68,0.04)' : 'rgba(0,230,118,0.04)'
                }}>
                  <div className="font-display font-bold text-xs mb-1" style={{ color: 'var(--depot-white)' }}>Maximo Job Card</div>
                  <div className={`font-mono text-sm font-bold ${trainData.open_job_card ? 'text-depot-red' : 'text-depot-green'}`}>
                    {trainData.open_job_card ? '✗ OPEN CARD' : '✓ CLEAR'}
                  </div>
                </div>
                <div className="panel p-3" style={{
                  borderColor: trainData.sensor_alert ? '#ff174433' : '#00e67633',
                  background:  trainData.sensor_alert ? 'rgba(255,23,68,0.04)' : 'rgba(0,230,118,0.04)'
                }}>
                  <div className="font-display font-bold text-xs mb-1" style={{ color: 'var(--depot-white)' }}>IoT Sensor Status</div>
                  <div className={`font-mono text-sm font-bold ${trainData.sensor_alert ? 'text-depot-red' : 'text-depot-green'}`}>
                    {trainData.sensor_alert ? '✗ ALERT ACTIVE' : '✓ NOMINAL'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <MileageBandTable currentMileage={trainData?.mileage ?? null} />
        </>
      )}
    </div>
  )
}