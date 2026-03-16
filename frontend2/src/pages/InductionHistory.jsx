// src/pages/InductionHistory.jsx
import { useState, useEffect } from 'react'
import { getInductionLogs } from '../api/api'
import { Badge, Spinner, EmptyState } from '../components/ui/index'
import { RefreshCw, History, ChevronDown, ChevronUp } from 'lucide-react'

const TRAFFIC_LABELS = { 1: 'L1 – Very Low', 2: 'L2 – Low', 3: 'L3 – Moderate', 4: 'L4 – High', 5: 'L5 – Peak' }
const TRAFFIC_COLORS = { 1: '#00e676', 2: '#00c2ff', 3: '#ffd740', 4: '#ff6d00', 5: '#ff1744' }

function TrainList({ trains, variant }) {
  if (!trains || trains.length === 0) return <span className="text-depot-muted text-xs">none</span>
  const variants = { service: 'service', standby: 'standby', maintenance: 'maintenance' }
  return (
    <div className="flex flex-wrap gap-1">
      {trains.map(name => (
        <Badge key={name} variant={variants[variant]}>{name}</Badge>
      ))}
    </div>
  )
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const ts = new Date(log.timestamp)
  const dateStr  = ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr  = ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const tColor   = TRAFFIC_COLORS[log.traffic_level] || '#64748b'

  return (
    <>
      <tr className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td>
          <div className="font-mono text-xs text-depot-accent">{dateStr}</div>
          <div className="font-mono text-2xs text-depot-muted">{timeStr} IST</div>
        </td>
        <td>
          <span
            className="font-display font-bold text-xs tracking-wide"
            style={{ color: tColor }}
          >
            {TRAFFIC_LABELS[log.traffic_level] || log.traffic_level}
          </span>
        </td>
        <td>
          <span className="font-mono text-depot-green">{log.service?.length ?? 0}</span>
          <span className="text-depot-muted text-xs ml-1">trains</span>
        </td>
        <td>
          <span className="font-mono text-depot-yellow">{log.standby?.length ?? 0}</span>
          <span className="text-depot-muted text-xs ml-1">trains</span>
        </td>
        <td>
          <span className="font-mono text-depot-red">{log.maintenance?.length ?? 0}</span>
          <span className="text-depot-muted text-xs ml-1">trains</span>
        </td>
        <td>
          <button className="text-depot-muted hover:text-depot-accent transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-depot-bg px-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="section-label mb-2">Service ({log.service?.length ?? 0})</div>
                <TrainList trains={log.service} variant="service" />
              </div>
              <div>
                <div className="section-label mb-2">Standby ({log.standby?.length ?? 0})</div>
                <TrainList trains={log.standby} variant="standby" />
              </div>
              <div>
                <div className="section-label mb-2">Maintenance ({log.maintenance?.length ?? 0})</div>
                <TrainList trains={log.maintenance} variant="maintenance" />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function InductionHistory() {
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter]   = useState(0)  // 0 = all

  const load = async () => {
    setLoading(true)
    try {
      const data = await getInductionLogs()
      setLogs(data.reverse())  // newest first
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 0 ? logs : logs.filter(l => l.traffic_level === filter)

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="panel p-3">
          <div className="font-mono text-2xl font-bold text-depot-accent">{logs.length}</div>
          <div className="font-display text-xs text-depot-muted">Total Induction Runs</div>
        </div>
        {[1,2,3,4,5].slice(0,3).map(lvl => {
          const count = logs.filter(l => l.traffic_level === lvl).length
          return (
            <div key={lvl} className="panel p-3" style={{ borderColor: `${TRAFFIC_COLORS[lvl]}33` }}>
              <div className="font-mono text-2xl font-bold" style={{ color: TRAFFIC_COLORS[lvl] }}>{count}</div>
              <div className="font-display text-xs text-depot-muted">Traffic {TRAFFIC_LABELS[lvl]}</div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        {/* Header + filter */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-depot-border">
          <div className="flex items-center gap-2">
            <History size={13} className="text-depot-accent" />
            <span className="section-label">Induction Audit Logs</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Traffic filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter(0)}
                className={`font-mono text-2xs px-2 py-1 rounded-sm border transition-colors ${filter === 0 ? 'border-depot-accent text-depot-accent' : 'border-depot-border text-depot-muted'}`}
              >ALL</button>
              {[1,2,3,4,5].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`font-mono text-2xs px-2 py-1 rounded-sm border transition-colors ${filter === lvl ? 'text-depot-white' : 'border-depot-border text-depot-muted'}`}
                  style={filter === lvl ? { borderColor: TRAFFIC_COLORS[lvl], color: TRAFFIC_COLORS[lvl] } : {}}
                >
                  L{lvl}
                </button>
              ))}
            </div>
            <button onClick={load} disabled={loading} className="btn btn-ghost text-xs px-2 py-1">
              {loading ? <Spinner size={11} /> : <RefreshCw size={11} />}
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="No induction logs found"
            sub="Run Generate Induction to create audit entries"
          />
        ) : (
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Traffic Level</th>
                  <th>Service</th>
                  <th>Standby</th>
                  <th>Maintenance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <LogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}