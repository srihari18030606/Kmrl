// src/pages/ResourceUtilisation.jsx
import { useState, useEffect } from 'react'
import { getResourceUtil, getShuntingIndex, getDepotLayout } from '../api/api'
import { Spinner } from '../components/ui/index'
import { RefreshCw, Layers, GitBranch, BarChart2, Box } from 'lucide-react'

function MetricBlock({ label, value, unit, icon: Icon, color, sub, bar, barMax }) {
  const pct = barMax ? Math.min((value / barMax) * 100, 100) : null
  return (
    <div className="panel p-5" style={{ borderColor: `${color}33` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} style={{ color }} />}
          <span className="font-display font-bold text-xs tracking-widest text-depot-white uppercase">
            {label}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="font-mono text-3xl font-bold" style={{ color }}>{value}</span>
        <span className="font-mono text-sm text-depot-muted">{unit}</span>
      </div>
      {bar && pct !== null && (
        <div className="h-1.5 bg-depot-border rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      )}
      {sub && <p className="font-body text-depot-muted text-xs leading-snug">{sub}</p>}
    </div>
  )
}

function TrackLoadGrid({ layout }) {
  if (!layout || Object.keys(layout).length === 0) return null

  const tracks = [
    { key: 'track1', label: 'Track 1', cap: 5, type: 'Service' },
    { key: 'track2', label: 'Track 2', cap: 5, type: 'Service' },
    { key: 'track3', label: 'Track 3', cap: 5, type: 'Standby' },
    { key: 'track4', label: 'Track 4', cap: 10, type: 'Standby' },
    { key: 'inspection', label: 'IBL',  cap: 10, type: 'Maintenance' },
  ]
  const typeColors = {
    Service:     '#00e676',
    Standby:     '#ffd740',
    Maintenance: '#ff1744',
  }

  return (
    <div className="panel p-4">
      <div className="section-label mb-3">Track Load Distribution</div>
      <div className="space-y-3">
        {tracks.map(({ key, label, cap, type }) => {
          const count = (layout[key] || []).length
          const pct = (count / cap) * 100
          const color = typeColors[type]
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="flex items-center gap-2" style={{ width: 120 }}>
                <span className="font-display font-semibold text-xs text-depot-text">{label}</span>
                <span className="font-display text-2xs text-depot-muted">({type})</span>
              </div>
              <div className="flex-1 h-3 bg-depot-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="font-mono text-xs text-depot-muted" style={{ width: 50, textAlign: 'right' }}>
                {count}/{cap}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ResourceUtilisation() {
  const [util, setUtil]       = useState(null)
  const [shunting, setShunting] = useState(null)
  const [layout, setLayout]   = useState(null)
  const [loading, setLoading]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [u, s, l] = await Promise.all([
        getResourceUtil(),
        getShuntingIndex(),
        getDepotLayout(),
      ])
      setUtil(u)
      setShunting(s)
      setLayout(l)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading && !util) return (
    <div className="flex justify-center py-20"><Spinner size={24} /></div>
  )

  const occupancyPct = util ? Math.round(util.occupancy_ratio * 100) : 0
  const shuntingVal  = shunting?.shunting_complexity_index ?? 0
  const shuntColor   = shuntingVal === 0 ? '#00e676' : shuntingVal <= 2 ? '#ffd740' : '#ff1744'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">Operational Resource Metrics</span>
        <button onClick={load} disabled={loading} className="btn btn-ghost text-xs px-2 py-1">
          {loading ? <Spinner size={11} /> : <RefreshCw size={11} />}
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBlock
          label="Cleaning Bays Used"
          value={util?.cleaning_bays_used ?? '—'}
          unit="bays"
          icon={Layers}
          color="#00c2ff"
          bar
          barMax={5}
          sub="Active cleaning bays from last induction cycle"
        />
        <MetricBlock
          label="Active Tracks"
          value={util?.active_tracks ?? '—'}
          unit="/ 5"
          icon={GitBranch}
          color="#00e676"
          bar
          barMax={5}
          sub="Tracks with at least one train assigned (incl. IBL)"
        />
        <MetricBlock
          label="Depot Occupancy"
          value={occupancyPct}
          unit="%"
          icon={Box}
          color={occupancyPct > 90 ? '#ff1744' : occupancyPct > 70 ? '#ffd740' : '#00e676'}
          bar
          barMax={100}
          sub={`${occupancyPct}% of total depot slot capacity occupied`}
        />
        <MetricBlock
          label="Shunting Complexity Index"
          value={shuntingVal}
          unit="pts"
          icon={BarChart2}
          color={shuntColor}
          sub="Difference between max and min track occupancy. Lower = better. 0 = balanced."
        />
      </div>

      {/* Track load bar chart */}
      <TrackLoadGrid layout={layout} />

      {/* Interpretation panel */}
      <div className="panel p-4">
        <div className="section-label mb-3">Operational Interpretation</div>
        <div className="space-y-2">
          {[
            {
              ok: (util?.cleaning_bays_used ?? 0) <= 4,
              text: (util?.cleaning_bays_used ?? 0) <= 4
                ? `Cleaning bays within capacity. ${5 - (util?.cleaning_bays_used ?? 0)} bays available.`
                : 'Cleaning bay capacity at limit. Consider deferring non-critical cleans.'
            },
            {
              ok: occupancyPct < 90,
              text: occupancyPct < 90
                ? `Depot occupancy at ${occupancyPct}%. Buffer exists for unscheduled rakes.`
                : 'Depot nearing full capacity. Limited space for emergency rake additions.'
            },
            {
              ok: shuntingVal <= 2,
              text: shuntingVal <= 2
                ? `Shunting index ${shuntingVal} — track loads are balanced, minimal repositioning required.`
                : `Shunting index ${shuntingVal} — imbalanced track allocation. Morning turnout may require repositioning.`
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`font-mono text-xs mt-0.5 ${item.ok ? 'text-depot-green' : 'text-depot-yellow'}`}>
                {item.ok ? '✓' : '⚠'}
              </span>
              <span className="font-body text-xs text-depot-muted leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}