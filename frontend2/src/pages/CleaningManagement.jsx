// src/pages/CleaningManagement.jsx
import { useState, useEffect } from 'react'
import { getTrains, getCleaningPlan } from '../api/api'
import { Badge, Spinner, EmptyState, StatusDot } from '../components/ui/index'
import { RefreshCw, Droplets } from 'lucide-react'

function HygieneBar({ days }) {
  const pct = Math.min((days / 10) * 100, 100)
  const color =
    days >= 9 ? '#ff1744' :
    days >= 6 ? '#ff6d00' :
    days >= 3 ? '#ffd740' : '#00e676'

  const label =
    days >= 9 ? 'CRITICAL' :
    days >= 6 ? 'DIRTY' :
    days >= 3 ? 'MILD' : 'CLEAN'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-depot-border rounded-full overflow-hidden" style={{ minWidth: 80 }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-display text-2xs tracking-widest" style={{ color, minWidth: 48 }}>
        {label}
      </span>
    </div>
  )
}

export default function CleaningManagement() {
  const [trains, setTrains] = useState([])
  const [cleaningPlan, setCleaningPlan] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState('days_since_cleaning')
  const [sortDir, setSortDir] = useState('desc')

  const load = async () => {
    setLoading(true)
    try {
      const [t, cp] = await Promise.all([getTrains(), getCleaningPlan()])
      setTrains(t)
      setCleaningPlan(cp.cleaning_trains || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...trains].sort((a, b) => {
    const va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0
    return sortDir === 'asc' ? va - vb : vb - va
  })

  const SortBtn = ({ k, label }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 transition-colors ${
        sortKey === k ? 'text-depot-accent' : 'text-depot-muted hover:text-depot-text'
      }`}
    >
      {label}
      <span className="text-2xs">{sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
    </button>
  )

  // Stats
  const critical = trains.filter(t => t.days_since_cleaning >= 9).length
  const dirty    = trains.filter(t => t.days_since_cleaning >= 6 && t.days_since_cleaning < 9).length
  const mild     = trains.filter(t => t.days_since_cleaning >= 3 && t.days_since_cleaning < 6).length
  const clean    = trains.filter(t => t.days_since_cleaning < 3).length

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Critical (≥9d)', val: critical, color: '#ff1744' },
          { label: 'Dirty (6–9d)',   val: dirty,    color: '#ff6d00' },
          { label: 'Mild (3–6d)',    val: mild,     color: '#ffd740' },
          { label: 'Clean (<3d)',    val: clean,    color: '#00e676' },
        ].map(s => (
          <div key={s.label} className="panel p-3 border" style={{ borderColor: `${s.color}33` }}>
            <div className="font-mono text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="font-display text-xs text-depot-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scheduled badge */}
      {cleaningPlan.length > 0 && (
        <div className="panel p-3 mb-4 border border-depot-accent/30 flex items-center gap-3">
          <Droplets size={14} className="text-depot-accent" />
          <div className="flex-1">
            <span className="font-display font-bold text-xs text-depot-accent tracking-wide">
              CLEANING SCHEDULED THIS CYCLE:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {cleaningPlan.map(name => (
                <Badge key={name} variant="accent">{name}</Badge>
              ))}
            </div>
          </div>
          <span className="font-mono text-depot-muted text-xs">{cleaningPlan.length} trains</span>
        </div>
      )}

      {/* Table */}
      <div className="panel">
        <div className="flex items-center justify-between px-4 py-3 border-b border-depot-border">
          <span className="section-label">Fleet Cleaning Status</span>
          <button onClick={load} disabled={loading} className="btn btn-ghost text-xs px-2 py-1">
            {loading ? <Spinner size={11} /> : <RefreshCw size={11} />}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : trains.length === 0 ? (
          <EmptyState message="No train data" sub="Populate database first" />
        ) : (
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Train</th>
                  <th><SortBtn k="days_since_cleaning" label="Days Since Cleaning" /></th>
                  <th>Hygiene Level</th>
                  <th>Hygiene Bar</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => {
                  const scheduled = cleaningPlan.includes(t.name)
                  const d = t.days_since_cleaning
                  const hygiene =
                    d >= 9 ? { label: 'CRITICAL', color: '#ff1744' } :
                    d >= 6 ? { label: 'DIRTY',    color: '#ff6d00' } :
                    d >= 3 ? { label: 'MILD',     color: '#ffd740' } :
                             { label: 'CLEAN',    color: '#00e676' }
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusDot
                            color={d >= 9 ? 'red' : d >= 6 ? 'red' : d >= 3 ? 'yellow' : 'green'}
                            pulse={d >= 6}
                          />
                          <span className="font-mono font-bold text-depot-white">{t.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: hygiene.color }}>
                          {d} days
                        </span>
                      </td>
                      <td>
                        <span
                          className="font-display text-xs font-bold tracking-widest"
                          style={{ color: hygiene.color }}
                        >
                          {hygiene.label}
                        </span>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <HygieneBar days={d} />
                      </td>
                      <td>
                        {scheduled
                          ? <Badge variant="accent">Scheduled</Badge>
                          : <span className="text-depot-muted text-xs">—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}