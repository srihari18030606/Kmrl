import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSecurityLogs } from '../context/SecurityLogContext'
import loginBg from '../assets/login-bg.jpg'

const USERS = [
  { id: 'ADMIN001', password: 'admin123', role: 'admin' },
  { id: 'OPS001', password: 'ops123', role: 'operations' },
  { id: 'MAINT001', password: 'maint123', role: 'maintenance' },
  { id: 'CLEAN001', password: 'clean123', role: 'cleaning' },
  { id: 'COMM001', password: 'comm123', role: 'commercial' }
]

export default function Login() {
  const { login } = useAuth()
const { addLog } = useSecurityLogs()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const user = USERS.find(
      u => u.id === employeeId && u.password === password
    )

    if (!user) {
  addLog({
    user: employeeId || 'Unknown',
    event: 'Login Attempt',
    module: 'Authentication',
    status: 'Failed'
  })

  setError('Invalid Employee ID or Password')
  return
}
addLog({
  user: user.id,
  event: 'Login Success',
  module: 'Authentication',
  status: 'Success'
})

login(user)
  }


return (
  <div
  className="min-h-screen flex items-center justify-center relative"
    style={{
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  >
    {/* Dark Overlay */}
    <div
      className="absolute inset-0"
      style={{
        background: 'rgba(0,0,0,0.15)'
      }}
    ></div>

    {/* Login Card */}
    <div
      cclassName="panel w-full max-w-md p-8 relative z-10"
      style={{
  background: 'rgba(10,15,25,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
}}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="font-display font-bold text-4xl tracking-widest mb-2"
          style={{ color: 'var(--depot-accent)' }}
        >
          KMRL
        </div>

        <div
          className="font-display text-lg font-semibold"
          style={{ color: 'var(--depot-white)' }}
        >
          Fleet Induction DSS
        </div>

        <div
          className="text-sm mt-2"
          style={{ color: 'var(--depot-muted)' }}
        >
          AI-Driven Train Induction Planning & Scheduling
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <div
          className="w-2 h-2 rounded-full pulse-green"
          style={{ background: 'var(--depot-green)' }}
        />
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--depot-green)' }}
        >
          SYSTEM ONLINE
        </span>
      </div>

      {/* Employee ID */}
      <input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded-sm"
        style={{
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ffffff'
}}
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-sm"
        style={{
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ffffff'
}}
      />

      {error && (
        <p className="text-red-500 text-sm mb-3">
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        className="btn btn-primary w-full"
      >
        LOGIN
      </button>
    </div>
  </div>
)

}