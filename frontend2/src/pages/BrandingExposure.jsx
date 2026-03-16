// src/pages/BrandingExposure.jsx
import { useState, useEffect } from 'react'
import { getTrains } from '../api/api'
import { Badge, Spinner, EmptyState, StatusDot } from '../components/ui/index'
import { RefreshCw, Tag, AlertTriangle } from 'lucide-react'

function UrgencyBar({ achieved, total, daysRemaining }) {
  if (!total || total === 0) return <span className="text-depot-muted text-xs">N/A</span>

  const pct = Math.min((achieved / total) * 100, 100)
  const remaining = total - achieved
  const isOverdue = daysRemaining !== null && daysRemaining <= 0
  const isUrgent  = daysRemaining !== null && daysRemaining <= 3

  const fillColor =
    isOverdue ? '#ff1744' :
    isUrgent  ? '#ff6d00' :
    pct >= 80 ? '#00e676' :
    pct >= 50 ? '#ffd740' : '#00c2ff'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-depot-border rounded-full overflow-hidden" style={{ minWidth: 100 }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
      <span className="font-mono text-xs" style={{ color: fillColor, minWidth: 36, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

export default function BrandingExposure() {
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const t = await getTrains()
      setTrains(t)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const branded = trains.filter(t => t.is_branded)
  const overdue = branded.filter(t => t.contract_days_remaining !== null && t.contract_days_remaining <= 0)
  const urgent  = branded.filter(t => t.contract_days_remaining !== null && t.contract_days_remaining > 0 && t.contract_days_remaining <= 3)
  const ontrack = branded.filter(t => t.contract_days_remaining !== null && t.contract_days_remaining > 3)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="panel p-3 border border-depot-accent/30">
          <div className="font-mono text-2xl font-bold text-depot-accent">{branded.length}</div>
          <div className="font-display text-xs text-depot-muted">Active Branding Contracts</div>
        </div>
        <div className="panel p-3 border border-depot-red/30">
          <div className="font-mono text-2xl font-bold text-depot-red">{overdue.length}</div>
          <div className="font-display text-xs text-depot-muted">Overdue Contracts</div>
        </div>
        <div className="panel p-3 border border-depot-orange/30">
          <div className="font-mono text-2xl font-bold" style={{ color: '#ff6d00' }}>{urgent.length}</div>
          <div className="font-display text-xs text-depot-muted">Urgent (&lt;3 days)</div>
        </div>
        <div className="panel p-3 border border-depot-green/30">
          <div className="font-mono text-2xl font-bold text-depot-green">{ontrack.length}</div>
          <div className="font-display text-xs text-depot-muted">On-Track Contracts</div>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="panel p-3 mb-4 border border-depot-red/40 flex items-start gap-3">
          <AlertTriangle size={14} className="text-depot-red mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-display font-bold text-xs text-depot-red tracking-wide uppercase">
              Branding SLA Breach Risk
            </span>
            <p className="font-body text-depot-muted text-xs mt-0.5">
              {overdue.map(t => t.name).join(', ')} — contract deadline passed, exposure target not met.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="panel">
        <div className="flex items-center justify-between px-4 py-3 border-b border-depot-border">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-depot-accent" />
            <span className="section-label">Branding Exposure Tracker</span>
          </div>
          <button onClick={load} disabled={loading} className="btn btn-ghost text-xs px-2 py-1">
            {loading ? <Spinner size={11} /> : <RefreshCw size={11} />}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : branded.length === 0 ? (
          <EmptyState
            message="No branded trains in fleet"
            sub="Upload a branding CSV to configure contracts"
          />
        ) : (
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Train</th>
                  <th>Exposure Achieved</th>
                  <th>Total Exposure</th>
                  <th>Days Remaining</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {branded
                  .sort((a, b) => (a.contract_days_remaining ?? 999) - (b.contract_days_remaining ?? 999))
                  .map(t => {
                    const isOverdue = t.contract_days_remaining !== null && t.contract_days_remaining <= 0
                    const isUrgent  = !isOverdue && t.contract_days_remaining !== null && t.contract_days_remaining <= 3
                    const status = isOverdue ? 'overdue' : isUrgent ? 'urgent' : 'active'
                    const statusLabel = isOverdue ? 'OVERDUE' : isUrgent ? 'URGENT' : 'ACTIVE'
                    const statusColor = isOverdue ? 'maintenance' : isUrgent ? 'forced' : 'service'

                    return (
                      <tr key={t.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <StatusDot
                              color={isOverdue ? 'red' : isUrgent ? 'yellow' : 'green'}
                              pulse={isOverdue || isUrgent}
                            />
                            <span className="font-mono font-bold text-depot-white">{t.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-depot-text">
                            {t.exposure_achieved?.toFixed(1) ?? '—'} hrs
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-depot-text">
                            {t.contract_total_exposure?.toFixed(1) ?? '—'} hrs
                          </span>
                        </td>
                        <td>
                          <span className={`font-mono font-bold ${
                            isOverdue ? 'text-depot-red' :
                            isUrgent  ? 'text-depot-yellow' :
                            'text-depot-text'
                          }`}>
                            {t.contract_days_remaining !== null
                              ? isOverdue
                                ? `${Math.abs(t.contract_days_remaining)}d overdue`
                                : `${t.contract_days_remaining}d`
                              : '—'
                            }
                          </span>
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <UrgencyBar
                            achieved={t.exposure_achieved}
                            total={t.contract_total_exposure}
                            daysRemaining={t.contract_days_remaining}
                          />
                        </td>
                        <td>
                          <Badge variant={statusColor}>{statusLabel}</Badge>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Non-branded */}
      {trains.filter(t => !t.is_branded).length > 0 && (
        <div className="panel mt-4 p-4">
          <div className="section-label mb-2">Non-Branded Fleet</div>
          <div className="flex flex-wrap gap-1.5">
            {trains.filter(t => !t.is_branded).map(t => (
              <Badge key={t.id} variant="default">{t.name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}