import { Shield, Users, AlertTriangle, Database } from 'lucide-react'
import { useSecurityLogs } from '../context/SecurityLogContext'


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

export default function SecurityCenter() {
    const { logs } = useSecurityLogs()

console.log("SECURITY LOGS:", logs)
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Active Users"
          value="5"
          icon={Users}
          color="var(--depot-green)"
        />

        <StatCard
          title="Failed Logins"
          value={logs.filter(l => l.status === 'Failed').length}
          icon={AlertTriangle}
          color="var(--depot-red)"
        />

        <StatCard
          title="Overrides Today"
          value={logs.filter(l => l.event.includes('Override')).length}
          icon={Shield}
          color="var(--depot-yellow)"
        />

        <StatCard
          title="Data Uploads"
          value="7"
          icon={Database}
          color="var(--depot-accent)"
        />
      </div>

      {/* Security Log Table */}
      <div className="panel">
        <div className="p-4 border-b border-depot-border">
          <div className="font-display font-bold text-sm tracking-widest uppercase text-depot-accent">
            Security Event Log
          </div>

          <div className="text-xs text-depot-muted mt-1">
            Authentication, Override and System Activity Monitoring
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Event</th>
              <th>Module</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.time}</td>
                <td>{log.user}</td>
                <td>{log.event}</td>
                <td>{log.module}</td>

                <td>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        log.status === 'Success'
                          ? 'var(--depot-green)'
                          : 'var(--depot-red)'
                    }}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}