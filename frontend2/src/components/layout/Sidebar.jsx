// // src/components/layout/Sidebar.jsx
// import { NavLink } from 'react-router-dom'
// import {
//   LayoutDashboard, Map, Droplets, Tag,
//   Bell, History, BarChart2, Brain, ChevronRight
// } from 'lucide-react'

// const NAV = [
//   { to: '/',              icon: LayoutDashboard, label: 'Induction Panel',     sub: 'Main Control' },
//   { to: '/depot',         icon: Map,             label: 'Depot Layout',        sub: 'Track Geometry' },
//   { to: '/cleaning',      icon: Droplets,        label: 'Cleaning Mgmt',       sub: 'Hygiene Status' },
//   { to: '/branding',      icon: Tag,             label: 'Branding Exposure',   sub: 'Contract KPIs' },
//   { to: '/alerts',        icon: Bell,            label: 'Alerts & Fleet Health',sub: 'KPI Monitor' },
//   { to: '/history',       icon: History,         label: 'Induction History',   sub: 'Audit Logs' },
//   { to: '/resources',     icon: BarChart2,       label: 'Resource Utilisation',sub: 'Bay & Track Load' },
//   { to: '/explainability',icon: Brain,           label: 'Decision Explainability', sub: 'Score Breakdown' },
// ]

// export default function Sidebar() {
//   return (
//     <aside
//       className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
//       style={{ background: '#08090d', borderRight: '1px solid #1c2535' }}
//     >
//       {/* Header */}
//       <div className="px-4 py-5 border-b border-depot-border">
//         <div className="flex items-center gap-2 mb-1">
//           <div className="w-2 h-2 rounded-full bg-depot-green pulse-green" />
//           <span className="font-display font-bold text-xs tracking-widest text-depot-accent uppercase">
//             KMRL
//           </span>
//         </div>
//         <div className="font-display font-bold text-white text-base leading-tight tracking-wide">
//           Fleet Induction
//         </div>
//         <div className="font-display text-depot-muted text-xs tracking-wide">
//           Decision Support System
//         </div>
//       </div>

//       {/* Nav label */}
//       <div className="px-4 pt-4 pb-1">
//         <span className="section-label">Navigation</span>
//       </div>

//       {/* Links */}
//       <nav className="flex-1 overflow-y-auto px-2 pb-4">
//         {NAV.map(({ to, icon: Icon, label, sub }) => (
//           <NavLink
//             key={to}
//             to={to}
//             end={to === '/'}
//             className={({ isActive }) =>
//               `group flex items-center gap-3 px-3 py-2.5 rounded-sm mb-0.5 transition-all duration-150 ${
//                 isActive
//                   ? 'bg-depot-dim border-l-2 border-depot-accent'
//                   : 'border-l-2 border-transparent hover:bg-depot-card hover:border-depot-dim'
//               }`
//             }
//           >
//             {({ isActive }) => (
//               <>
//                 <Icon
//                   size={15}
//                   className={isActive ? 'text-depot-accent' : 'text-depot-muted group-hover:text-depot-text'}
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className={`font-display font-semibold text-xs leading-tight tracking-wide ${
//                     isActive ? 'text-depot-white' : 'text-depot-text group-hover:text-depot-white'
//                   }`}>
//                     {label}
//                   </div>
//                   <div className="text-2xs text-depot-muted leading-tight mt-0.5">{sub}</div>
//                 </div>
//                 {isActive && <ChevronRight size={12} className="text-depot-accent flex-shrink-0" />}
//               </>
//             )}
//           </NavLink>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div className="px-4 py-3 border-t border-depot-border">
//         <div className="font-mono text-2xs text-depot-muted">v1.0.0 · KMRL DSS</div>
//         <div className="font-mono text-2xs text-depot-muted mt-0.5">
//           {new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
//         </div>
//       </div>
//     </aside>
//   )
// }

// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, Droplets, Tag,
  Bell, History, BarChart2, Brain, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Induction Panel',      sub: 'Main Control' },
  { to: '/depot',          icon: Map,             label: 'Depot Layout',         sub: 'Track Geometry' },
  { to: '/cleaning',       icon: Droplets,        label: 'Cleaning Mgmt',        sub: 'Hygiene Status' },
  { to: '/branding',       icon: Tag,             label: 'Branding Exposure',    sub: 'Contract KPIs' },
  { to: '/alerts',         icon: Bell,            label: 'Alerts & Fleet Health',sub: 'KPI Monitor' },
  { to: '/history',        icon: History,         label: 'Induction History',    sub: 'Audit Logs' },
  { to: '/resources',      icon: BarChart2,       label: 'Resource Utilisation', sub: 'Bay & Track Load' },
  { to: '/explainability', icon: Brain,           label: 'Decision Explainability', sub: 'Score Breakdown' },
]

export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40 transition-colors duration-200"
      style={{
        background: 'var(--depot-panel)',
        borderRight: '1px solid var(--depot-border)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-5 border-b border-depot-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-depot-green pulse-green" />
          <span className="font-display font-bold text-xs tracking-widest text-depot-accent uppercase">
            KMRL
          </span>
        </div>
        <div className="font-display font-bold text-depot-white text-base leading-tight tracking-wide">
          Fleet Induction
        </div>
        <div className="font-display text-depot-muted text-xs tracking-wide">
          Decision Support System
        </div>
      </div>

      {/* Nav label */}
      <div className="px-4 pt-4 pb-1">
        <span className="section-label">Navigation</span>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {NAV.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-sm mb-0.5 transition-all duration-150 ${
                isActive
                  ? 'bg-depot-dim border-l-2 border-depot-accent'
                  : 'border-l-2 border-transparent hover:bg-depot-card hover:border-depot-dim'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={isActive ? 'text-depot-accent' : 'text-depot-muted group-hover:text-depot-text'}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-display font-semibold text-xs leading-tight tracking-wide ${
                    isActive ? 'text-depot-white' : 'text-depot-text group-hover:text-depot-white'
                  }`}>
                    {label}
                  </div>
                  <div className="text-2xs text-depot-muted leading-tight mt-0.5">{sub}</div>
                </div>
                {isActive && <ChevronRight size={12} className="text-depot-accent flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-depot-border">
        <div className="font-mono text-2xs text-depot-muted">v1.0.0 · KMRL DSS</div>
        <div className="font-mono text-2xs text-depot-muted mt-0.5">
          {new Date().toLocaleTimeString('en-IN', { hour12: false })} IST
        </div>
      </div>
    </aside>
  )
}