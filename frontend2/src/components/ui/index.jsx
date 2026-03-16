// src/components/ui/index.jsx
// Shared atomic UI components

export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    service:     'bg-green-950  text-depot-green  border border-depot-green/40',
    standby:     'bg-yellow-950 text-depot-yellow border border-depot-yellow/40',
    maintenance: 'bg-red-950    text-depot-red    border border-depot-red/40',
    cleaning:    'bg-blue-950   text-blue-300     border border-blue-400/40',
    forced:      'bg-orange-950 text-depot-orange border border-depot-orange/40',
    accent:      'bg-cyan-950   text-depot-accent border border-depot-accent/40',
    default:     'bg-depot-dim  text-depot-muted  border border-depot-border',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm font-display font-semibold text-2xs tracking-widest uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusDot({ color = 'green', pulse = false }) {
  const colors = {
    green:  'bg-depot-green',
    yellow: 'bg-depot-yellow',
    red:    'bg-depot-red',
    accent: 'bg-depot-accent',
    muted:  'bg-depot-muted',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[color]} ${pulse ? `pulse-${color}` : ''}`} />
  )
}

export function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`panel ${noPad ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  )
}

export function Spinner({ size = 16 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      className="animate-spin text-depot-accent"
      fill="none" stroke="currentColor" strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.2} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

export function SectionHeader({ label, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="section-label">{label}</span>
      {right && <div>{right}</div>}
    </div>
  )
}

export function KpiCard({ label, value, unit, color = 'accent', icon: Icon }) {
  const colors = {
    accent: 'text-depot-accent glow-accent',
    green:  'text-depot-green  glow-green',
    yellow: 'text-depot-yellow glow-yellow',
    red:    'text-depot-red    glow-red',
    muted:  'text-depot-muted',
  }
  const borderColors = {
    accent: 'border-depot-accent/30',
    green:  'border-depot-green/30',
    yellow: 'border-depot-yellow/30',
    red:    'border-depot-red/30',
    muted:  'border-depot-border',
  }
  return (
    <div className={`panel p-4 border ${borderColors[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="section-label">{label}</span>
        {Icon && <Icon size={14} className={colors[color]} />}
      </div>
      <div className={`font-mono text-2xl font-bold ${colors[color]}`}>
        {value}<span className="text-sm font-normal ml-1">{unit}</span>
      </div>
    </div>
  )
}

export function EmptyState({ message = 'No data available', sub = 'Run induction to populate' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-8 h-8 border-2 border-depot-border rounded-full flex items-center justify-center mb-3">
        <span className="text-depot-muted text-lg">—</span>
      </div>
      <div className="font-display font-semibold text-depot-muted text-sm tracking-wide">{message}</div>
      <div className="font-display text-depot-muted text-xs mt-1">{sub}</div>
    </div>
  )
}

export function AlertBanner({ type, message }) {
  const styles = {
    branding:    { border: '#ffd740', bg: 'rgba(255,215,64,0.06)',  text: '#ffd740', dot: 'yellow' },
    maintenance: { border: '#ff1744', bg: 'rgba(255,23,68,0.06)',   text: '#ff1744', dot: 'red'    },
    cleaning:    { border: '#00c2ff', bg: 'rgba(0,194,255,0.06)',   text: '#00c2ff', dot: 'accent' },
    info:        { border: '#64748b', bg: 'rgba(100,116,139,0.06)', text: '#64748b', dot: 'muted'  },
  }
  const s = styles[type] || styles.info
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-sm border"
      style={{ borderColor: s.border, background: s.bg }}
    >
      <StatusDot color={s.dot} pulse />
      <div className="flex-1 min-w-0">
        <span className="font-display font-semibold text-xs tracking-wide uppercase"
          style={{ color: s.text }}
        >{type}</span>
        <p className="font-body text-depot-text text-xs mt-0.5">{message}</p>
      </div>
    </div>
  )
}