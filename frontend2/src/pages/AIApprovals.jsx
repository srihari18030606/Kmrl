import { CheckCircle, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { useSecurityLogs } from '../context/SecurityLogContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const INITIAL_APPROVALS = [
  {
    train: 'T-07',
    score: 0.91,
    recommendation: 'Service',
    risk: '2%',
    status: 'Pending'
  },
  {
    train: 'T-16',
    score: 0.28,
    recommendation: 'Maintenance',
    risk: '31%',
    status: 'Pending'
  },
  {
    train: 'T-11',
    score: 0.82,
    recommendation: 'Standby',
    risk: '8%',
    status: 'Pending'
  }
]

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-label">{title}</div>
          <div
            className="font-mono text-2xl font-bold mt-2"
            style={{ color }}
          >
            {value}
          </div>
        </div>

        <Icon size={22} style={{ color }} />
      </div>
    </div>
  )
}

export default function AIApprovals() {

     const { addLog } = useSecurityLogs()
  const { user } = useAuth()
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS)

  const logAction = (action, train) => {
  addLog({
    user: user?.id || 'Unknown',
    event: `${action} ${train}`,
    module: 'AI Approvals',
    status: 'Success'
  })

  setApprovals(prev =>
    prev.map(item =>
      item.train === train
        ? {
            ...item,
            status:
              action === 'Approved'
                ? 'Approved'
                : action === 'Rejected'
                ? 'Rejected'
                : 'Override'
          }
        : item
    )
  )
}
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard
  title="Pending"
  value={approvals.filter(a => a.status === 'Pending').length}
          icon={ClipboardCheck}
          color="var(--depot-accent)"
        />

        <StatCard
  title="Approved"
  value={approvals.filter(a => a.status === 'Approved').length}
          icon={CheckCircle}
          color="var(--depot-green)"
        />

        <StatCard
  title="Rejected"
  value={approvals.filter(a => a.status === 'Rejected').length}
          icon={XCircle}
          color="var(--depot-red)"
        />

        <StatCard
  title="Overrides"
  value={approvals.filter(a => a.status === 'Override').length}
          icon={AlertTriangle}
          color="var(--depot-yellow)"
        />
      </div>

      {/* Table */}
      <div className="panel">
        <div className="p-4 border-b border-depot-border">
          <div className="font-display font-bold text-sm tracking-widest uppercase text-depot-accent">
            AI Approval Queue
          </div>

          <div className="text-xs text-depot-muted mt-1">
            Human Review Before Final Deployment
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Train</th>
              <th>Score</th>
              <th>Recommendation</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {approvals.map((item) => (
              <tr key={item.train}>
                <td>{item.train}</td>

                <td>
                  <span
                    className="font-mono"
                    style={{ color: 'var(--depot-green)' }}
                  >
                    {item.score}
                  </span>
                </td>

                <td>{item.recommendation}</td>

                <td>{item.risk}</td>

                <td>
                  <span
  className="font-mono"
  style={{
    color:
      item.status === 'Approved'
        ? 'var(--depot-green)'
        : item.status === 'Rejected'
        ? 'var(--depot-red)'
        : item.status === 'Override'
        ? 'var(--depot-yellow)'
        : 'var(--depot-yellow)'
  }}
>
  {item.status}
</span>
                </td>

                <td>
                  <div className="flex gap-2">
                    <button
  className="btn btn-success"
  onClick={() => logAction('Approved', item.train)}
>
  Approve
</button>

                    <button
  className="btn btn-danger"
  onClick={() => logAction('Rejected', item.train)}
>
  Reject
</button>

                    <button
  className="btn btn-warning"
  onClick={() => logAction('Override Applied To', item.train)}
>
  Override
</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}