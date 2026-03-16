// src/pages/AlertsFleetHealth.jsx
import { useState, useEffect } from 'react'
import { getAlerts, getFleetHealth, getDailyReport } from '../api/api'
import { AlertBanner, Spinner } from '../components/ui/index'
import { RefreshCw, CheckCircle, Activity, Gauge, Droplets, Tag } from 'lucide-react'

function GaugeRing({ pct, color, size = 72 }) {
  const r = (size / 2) - 7
  const circ = 2 * Math.PI * r
  const fill = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1c2535" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size/2} y={size/2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill={color}
        style={{ fontFamily: 'Share Tech Mono', fontSize: 13, fontWeight: 'bold' }}
      >
        {pct}%
      </text>
    </svg>
  )
}

function KpiRingCard({ label, pct, color, icon: Icon, sub }) {
  return (
    <div className="panel p-4 flex items-center gap-4" style={{ borderColor: `${color}33` }}>
      <GaugeRing pct={pct} color={color} />
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          {Icon && <Icon size={12} style={{ color }} />}
          <span className="font-display font-bold text-xs tracking-wide text-depot-white">{label}</span>
        </div>
        <p className="font-body text-depot-muted text-xs leading-snug">{sub}</p>
      </div>
    </div>
  )
}

function MileageBar({ avg }) {
  const MAX = 30000
  const pct = Math.min((avg / MAX) * 100, 100)
  const color =
    avg > 28000 ? '#ff1744' :
    avg > 24000 ? '#ff6d00' :
    avg > 18000 ? '#ffd740' : '#00e676'
  return (
    <div className="panel p-4" style={{ borderColor: `${color}33` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Gauge size={12} style={{ color }} />
          <span className="font-display font-bold text-xs tracking-wide text-depot-white">Average Fleet Mileage</span>
        </div>
        <span className="font-mono font-bold" style={{ color }}>{avg.toLocaleString()} km</span>
      </div>
      <div className="h-2 bg-depot-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between font-mono text-2xs text-depot-muted mt-1">
        <span>0</span>
        <span>Safe: 20k</span>
        <span>Caution: 26k</span>
        <span>Critical: 30k</span>
      </div>
    </div>
  )
}

export default function AlertsFleetHealth() {
  const [alerts, setAlerts]     = useState([])
  const [health, setHealth]     = useState(null)
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [a, h, r] = await Promise.all([getAlerts(), getFleetHealth(), getDailyReport()])
      setAlerts(a)
      setHealth(h)
      setReport(r)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading && !health) return (
    <div className="flex justify-center py-20"><Spinner size={24} /></div>
  )

  const safetyPct   = health ? Math.round(health.service_ready_ratio * 100)  : 0
  const cleanPct    = health ? Math.round((1 - health.cleaning_backlog_ratio) * 100) : 0
  const brandingPct = health ? Math.round((1 - health.branding_risk_ratio) * 100)   : 100

  return (
    <div className="space-y-4">
      {/* KPI Ring Cards */}
      <div>
        <div className="section-label mb-3">Fleet Health KPIs</div>
        <div className="grid grid-cols-3 gap-3">
          <KpiRingCard
            label="Service Readiness"
            pct={safetyPct}
            color={safetyPct >= 70 ? '#00e676' : safetyPct >= 50 ? '#ffd740' : '#ff1744'}
            icon={CheckCircle}
            sub="Trains cleared of all fitness, job-card and sensor constraints"
          />
          <KpiRingCard
            label="Fleet Hygiene"
            pct={cleanPct}
            color={cleanPct >= 70 ? '#00e676' : cleanPct >= 50 ? '#ffd740' : '#ff1744'}
            icon={Droplets}
            sub="Percentage of fleet within acceptable cleaning threshold (<6 days)"
          />
          <KpiRingCard
            label="Branding SLA Health"
            pct={brandingPct}
            color={brandingPct >= 80 ? '#00e676' : brandingPct >= 60 ? '#ffd740' : '#ff1744'}
            icon={Tag}
            sub="Branded trains not approaching contract deadline risk zone"
          />
        </div>
      </div>

      {/* Mileage bar */}
      {health && (
        <MileageBar avg={Math.round(health.avg_mileage)} />
      )}

      {/* Daily report quick stats */}
      {report && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-depot-accent" />
              <span className="section-label">Daily Fleet Report</span>
            </div>
            <span className={`font-display font-bold text-xs tracking-widest px-2 py-0.5 rounded-sm border ${
              report.system_status === 'Stable'
                ? 'text-depot-green border-depot-green/40 bg-green-950'
                : 'text-depot-yellow border-depot-yellow/40 bg-yellow-950'
            }`}>
              {report.system_status}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Fleet Size',         val: report.fleet_size,                    unit: 'trains', color: '#00c2ff' },
              { label: 'High Mileage',        val: report.high_mileage_trains,           unit: 'trains', color: '#ff6d00' },
              { label: 'Cleaning Backlog',    val: report.cleaning_backlog,              unit: 'trains', color: '#ffd740' },
              { label: 'Safety Clearance',    val: `${(report.safety_clearance_ratio*100).toFixed(0)}`, unit: '%',      color: '#00e676' },
              { label: 'Standby Margin Est.', val: report.standby_margin_estimate,       unit: 'trains', color: '#64748b' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="font-mono text-xl font-bold" style={{ color: item.color }}>
                  {item.val}<span className="text-xs ml-0.5 font-normal">{item.unit}</span>
                </div>
                <div className="font-display text-xs text-depot-muted mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Feed */}
      <div className="panel">
        <div className="flex items-center justify-between px-4 py-3 border-b border-depot-border">
          <span className="section-label">Live Alert Feed</span>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <span className="font-mono text-xs text-depot-red pulse-red">{alerts.length} active</span>
            )}
            <button onClick={load} disabled={loading} className="btn btn-ghost text-xs px-2 py-1">
              {loading ? <Spinner size={11} /> : <RefreshCw size={11} />}
              Refresh
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-sm border border-depot-green/30 bg-green-950/20">
              <CheckCircle size={14} className="text-depot-green" />
              <span className="font-display font-semibold text-xs text-depot-green tracking-wide">
                No active alerts — Fleet operating within normal parameters
              </span>
            </div>
          ) : (
            alerts.map((a, i) => (
              <AlertBanner key={i} type={a.type} message={a.message} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}