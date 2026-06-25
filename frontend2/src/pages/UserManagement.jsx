import { Users, UserCheck, Shield, UserX, Plus } from 'lucide-react'

const USERS = [
  { id: 'ADMIN001', role: 'admin', status: 'Active' },
  { id: 'OPS001', role: 'operations', status: 'Active' },
  { id: 'MAINT001', role: 'maintenance', status: 'Active' },
  { id: 'CLEAN001', role: 'cleaning', status: 'Active' },
  { id: 'COMM001', role: 'commercial', status: 'Active' },
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

export default function UserManagement() {
  return (
    <div>
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Users"
          value="5"
          icon={Users}
          color="var(--depot-accent)"
        />

        <StatCard
          title="Active Users"
          value="5"
          icon={UserCheck}
          color="var(--depot-green)"
        />

        <StatCard
          title="Admins"
          value="1"
          icon={Shield}
          color="var(--depot-yellow)"
        />

        <StatCard
          title="Disabled"
          value="0"
          icon={UserX}
          color="var(--depot-red)"
        />
      </div>

      {/* User Table */}
      <div className="panel">
        <div className="flex items-center justify-between p-4 border-b border-depot-border">
          <div>
            <div className="font-display font-bold text-sm tracking-widest uppercase text-depot-accent">
              User Management
            </div>

            <div className="text-xs text-depot-muted mt-1">
              Role-Based Access Control
            </div>
          </div>

          <button className="btn btn-primary">
            <Plus size={12} />
            Add User
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {USERS.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>

                <td>
                  <span className="font-mono">
                    {user.role}
                  </span>
                </td>

                <td>
                  <span
                    className="font-mono"
                    style={{ color: 'var(--depot-green)' }}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-warning">
                      Reset
                    </button>

                    <button className="btn btn-danger">
                      Disable
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