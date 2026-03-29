// // src/pages/DepotLayout.jsx
// import { useState, useEffect } from 'react'
// import { getDepotLayout } from '../api/api'
// import { Spinner, EmptyState } from '../components/ui/index'
// import { RefreshCw, MapPin } from 'lucide-react'

// const TRACK_CAPACITY = 5

// function TrainBlock({ name, type, position }) {
//   const styles = {
//     service:     { bg: 'rgba(0,230,118,0.12)',  border: '#00e676', text: '#00e676',  label: 'SVC' },
//     standby:     { bg: 'rgba(255,215,64,0.12)', border: '#ffd740', text: '#ffd740',  label: 'SBY' },
//     maintenance: { bg: 'rgba(255,23,68,0.12)',  border: '#ff1744', text: '#ff1744',  label: 'MNT' },
//     empty:       { bg: 'rgba(28,37,53,0.3)',    border: '#1c2535', text: '#243044',  label: '' },
//   }
//   const s = styles[type] || styles.empty
//   const isEmpty = type === 'empty'

//   return (
//     <div
//       className="relative flex flex-col items-center justify-center rounded-sm border transition-all duration-200"
//       style={{
//         background: s.bg,
//         borderColor: s.border,
//         width: '100%',
//         height: 72,
//         opacity: isEmpty ? 0.35 : 1,
//       }}
//     >
//       {!isEmpty ? (
//         <>
//           <div
//             className="font-mono font-bold text-sm"
//             style={{ color: s.text }}
//           >
//             {name}
//           </div>
//           <div
//             className="font-display text-2xs tracking-widest mt-0.5"
//             style={{ color: s.text, opacity: 0.7 }}
//           >
//             {s.label}
//           </div>
//           <div className="absolute top-1 right-1.5 font-mono text-2xs"
//             style={{ color: s.text, opacity: 0.5 }}>
//             P{position}
//           </div>
//         </>
//       ) : (
//         <div className="font-mono text-2xs" style={{ color: s.text }}>VACANT</div>
//       )}
//     </div>
//   )
// }

// function Track({ label, trains, type, capacity = TRACK_CAPACITY, color }) {
//   const slots = Array.from({ length: capacity }, (_, i) => {
//     const train = trains[i]
//     return train
//       ? { name: train, type, position: i + 1 }
//       : { name: '', type: 'empty', position: i + 1 }
//   })

//   const borderColors = {
//     service:     '#00e676',
//     standby:     '#ffd740',
//     maintenance: '#ff1744',
//     mixed:       '#1c2535',
//   }
//   const bc = borderColors[type] || borderColors.mixed

//   return (
//     <div className="panel overflow-hidden">
//       {/* Track header */}
//       <div
//         className="px-4 py-2.5 flex items-center justify-between border-b"
//         style={{ borderColor: '#1c2535', borderLeft: `3px solid ${bc}` }}
//       >
//         <div className="flex items-center gap-2">
//           <MapPin size={13} style={{ color: bc }} />
//           <span className="font-display font-bold text-sm tracking-wide text-depot-white">{label}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="font-mono text-2xs text-depot-muted">{trains.length}/{capacity} occupied</span>
//           <div
//             className="h-1.5 rounded-full"
//             style={{
//               width: 60,
//               background: '#1c2535',
//               position: 'relative',
//               overflow: 'hidden',
//             }}
//           >
//             <div
//               className="h-full rounded-full transition-all"
//               style={{
//                 width: `${(trains.length / capacity) * 100}%`,
//                 background: bc,
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Train slots */}
//       <div className="p-3 grid grid-cols-5 gap-2">
//         {slots.map((slot, i) => (
//           <TrainBlock key={i} {...slot} />
//         ))}
//       </div>
//     </div>
//   )
// }

// export default function DepotLayout() {
//   const [layout, setLayout] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const load = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const data = await getDepotLayout()
//       setLayout(data)
//     } catch (e) {
//       setError(e.message)
//     }
//     setLoading(false)
//   }

//   useEffect(() => { load() }, [])

//   // Determine type of each track based on which trains are present
//   // Track 1 & 2 = service, Track 3 & 4 = standby, IBL = maintenance
//   const getTracks = () => {
//     if (!layout) return []
//     return [
//       { label: 'Track 1 — Service', trains: layout.track1 || [], type: 'service',     capacity: 5 },
//       { label: 'Track 2 — Service', trains: layout.track2 || [], type: 'service',     capacity: 5 },
//       { label: 'Track 3 — Standby', trains: layout.track3 || [], type: 'standby',     capacity: 5 },
//       { label: 'Track 4 — Standby', trains: layout.track4 || [], type: 'standby',     capacity: 5 },
//       { label: 'Inspection Bay Line (IBL)', trains: layout.inspection || [], type: 'maintenance', capacity: 10 },
//     ]
//   }

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-3 text-2xs font-mono text-depot-muted">
//             <span className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#00e676' }} />
//               Service
//             </span>
//             <span className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ffd740' }} />
//               Standby
//             </span>
//             <span className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ff1744' }} />
//               Maintenance / IBL
//             </span>
//           </div>
//         </div>
//         <button onClick={load} disabled={loading} className="btn btn-ghost">
//           {loading ? <Spinner size={12} /> : <RefreshCw size={12} />}
//           Refresh
//         </button>
//       </div>

//       {error && (
//         <div className="panel p-4 border-depot-red/40 text-depot-red font-mono text-xs mb-4">
//           ✗ {error}
//         </div>
//       )}

//       {loading && !layout && (
//         <div className="flex items-center justify-center py-20">
//           <Spinner size={24} />
//         </div>
//       )}

//       {!loading && !layout && !error && (
//         <EmptyState
//           message="No depot layout available"
//           sub="Run induction to generate track assignments"
//         />
//       )}

//       {layout && (
//         <div className="space-y-3">
//           {getTracks().map((track, i) => (
//             <Track key={i} {...track} />
//           ))}
//         </div>
//       )}

//       {layout && (
//         <div className="mt-4 panel p-4">
//           <div className="section-label mb-3">Depot Summary</div>
//           <div className="grid grid-cols-5 gap-4">
//             {['track1', 'track2', 'track3', 'track4', 'inspection'].map((key, i) => {
//               const names = ['Track 1', 'Track 2', 'Track 3', 'Track 4', 'IBL']
//               const types = ['service', 'service', 'standby', 'standby', 'maintenance']
//               const colors = ['#00e676', '#00e676', '#ffd740', '#ffd740', '#ff1744']
//               const count = layout[key]?.length ?? 0
//               return (
//                 <div key={key} className="text-center">
//                   <div className="font-mono text-xl font-bold" style={{ color: colors[i] }}>{count}</div>
//                   <div className="font-display text-xs text-depot-muted">{names[i]}</div>
//                   <div className="font-display text-2xs text-depot-muted">{types[i]}</div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { getDepotLayout } from '../api/api'
import { Spinner, EmptyState } from '../components/ui/index'
import { RefreshCw, MapPin, Wrench } from 'lucide-react'

const TRACK_CAPACITY = 5

function TrainBlock({ name, type, position, onClick }) {
  const styles = {
    service:     { bg: 'rgba(0,230,118,0.12)',  border: '#00e676', text: '#00e676',  label: 'SVC' },
    standby:     { bg: 'rgba(255,215,64,0.12)', border: '#ffd740', text: '#ffd740',  label: 'SBY' },
    maintenance: { bg: 'rgba(255,23,68,0.12)',  border: '#ff1744', text: '#ff1744',  label: 'MNT' },
    bay:         { bg: 'rgba(0,194,255,0.12)',  border: '#00c2ff', text: '#00c2ff',  label: 'BAY' },
    queue:       { bg: 'rgba(255,109,0,0.12)',  border: '#ff6d00', text: '#ff6d00',  label: 'QUE' },
    empty:       { bg: 'rgba(28,37,53,0.3)',    border: '#1c2535', text: '#243044',  label: '' },
  }

  const s = styles[type] || styles.empty
  const isEmpty = type === 'empty'

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-sm border transition-all duration-200"
      onClick={onClick}
      style={{
        background: s.bg,
        borderColor: s.border,
        width: '100%',
        height: 72,
        opacity: isEmpty ? 0.35 : 1,
        cursor: name ? 'pointer' : 'default',
      }}
    >
      {!isEmpty ? (
        <>
          <div
            className="font-mono font-bold text-sm"
            style={{ color: s.text }}
          >
            {name}
          </div>
          <div
            className="font-display text-2xs tracking-widest mt-0.5"
            style={{ color: s.text, opacity: 0.7 }}
          >
            {s.label}
          </div>
          {position && (
            <div
              className="absolute top-1 right-1.5 font-mono text-2xs"
              style={{ color: s.text, opacity: 0.5 }}
            >
              P{position}
            </div>
          )}
        </>
      ) : (
        <div className="font-mono text-2xs" style={{ color: s.text }}>VACANT</div>
      )}
    </div>
  )
}

function Track({ label, trains, type, capacity = TRACK_CAPACITY }) {
  const slots = Array.from({ length: capacity }, (_, i) => {
    const train = trains[i]
    return train
      ? { name: train, type, position: i + 1 }
      : { name: '', type: 'empty', position: i + 1 }
  })

  const borderColors = {
    service: '#00e676',
    standby: '#ffd740',
    maintenance: '#ff1744',
    mixed: '#1c2535',
  }
  const bc = borderColors[type] || borderColors.mixed

  return (
    <div className="panel overflow-hidden">
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b"
        style={{ borderColor: '#1c2535', borderLeft: `3px solid ${bc}` }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={13} style={{ color: bc }} />
          <span className="font-display font-bold text-sm tracking-wide text-depot-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs text-depot-muted">{trains.length}/{capacity} occupied</span>
          <div
            className="h-1.5 rounded-full"
            style={{
              width: 60,
              background: '#1c2535',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(trains.length / capacity) * 100}%`,
                background: bc,
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-5 gap-2">
        {slots.map((slot, i) => (
          <TrainBlock key={i} {...slot} />
        ))}
      </div>
    </div>
  )
}

function MaintenanceBays({ bays, setSelectedTrain }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wrench size={14} style={{ color: '#00c2ff' }} />
        <span className="section-label">Maintenance Bays</span>
      </div>

      {bays.length === 0 ? (
        <div className="text-depot-muted text-xs font-mono">No active bay assignments</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {bays.map((b) => (
            <div
              key={b.bay}
              className="rounded-sm border p-3"
              style={{
                borderColor: '#00c2ff55',
                background: 'rgba(0,194,255,0.05)'
              }}
            >
              <div className="font-display text-xs text-depot-muted mb-1">
                Bay {b.bay}
              </div>
              <TrainBlock
                name={b.train}
                type="bay"
                onClick={() => setSelectedTrain({
                  name: b.train,
                  maintenance_reason: b.maintenance_reason,
                  placement_reason: b.placement_reason,
                  location: `Maintenance Bay ${b.bay}`
                })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaintenanceQueue({ queue, setSelectedTrain }) {
  return (
    <div className="panel p-4">
      <div className="section-label mb-3">Maintenance Waiting Queue</div>

      {queue.length === 0 ? (
        <div className="text-depot-muted text-xs font-mono">No queue</div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {queue.map((item, i) => (
            <TrainBlock
              key={item.train}
              name={item.train}
              type="queue"
              position={i + 1}
              onClick={() => setSelectedTrain({
                name: item.train,
                maintenance_reason: item.maintenance_reason,
                placement_reason: item.placement_reason,
                location: 'Waiting Queue'
              })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DepotLayout() {
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTrain, setSelectedTrain] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDepotLayout()
      setLayout(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const getTracks = () => {
    if (!layout) return []
    return [
      { label: 'Track 1 — Service', trains: layout.track1 || [], type: 'service', capacity: 5 },
      { label: 'Track 2 — Service', trains: layout.track2 || [], type: 'service', capacity: 5 },
      { label: 'Track 3 — Standby', trains: layout.track3 || [], type: 'standby', capacity: 5 },
      { label: 'Track 4 — Standby', trains: layout.track4 || [], type: 'standby', capacity: 5 },
      { label: 'Inspection Bay Line (IBL)', trains: layout.inspection || [], type: 'maintenance', capacity: 10 },
    ]
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-2xs font-mono text-depot-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#00e676' }} />
              Service
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ffd740' }} />
              Standby
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ff1744' }} />
              Maintenance / IBL
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#00c2ff' }} />
              Active Bays
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ff6d00' }} />
              Waiting Queue
            </span>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-ghost">
          {loading ? <Spinner size={12} /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="panel p-4 border-depot-red/40 text-depot-red font-mono text-xs mb-4">
          ✗ {error}
        </div>
      )}

      {loading && !layout && (
        <div className="flex items-center justify-center py-20">
          <Spinner size={24} />
        </div>
      )}

      {!loading && !layout && !error && (
        <EmptyState
          message="No depot layout available"
          sub="Run induction to generate track assignments"
        />
      )}

      {layout && (
        <>
          <div className="space-y-3">
            {getTracks().map((track, i) => (
              <Track key={i} {...track} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <MaintenanceBays
              bays={layout.maintenance_bays || []}
              setSelectedTrain={setSelectedTrain}
            />

            <MaintenanceQueue
              queue={layout.maintenance_queue || []}
              setSelectedTrain={setSelectedTrain}
            />
          </div>
        </>
      )}

      {layout && (
        <div className="mt-4 panel p-4">
          <div className="section-label mb-3">Depot Summary</div>
          <div className="grid grid-cols-7 gap-4">
            {[
              { key: 'track1', name: 'Track 1', color: '#00e676', type: 'service' },
              { key: 'track2', name: 'Track 2', color: '#00e676', type: 'service' },
              { key: 'track3', name: 'Track 3', color: '#ffd740', type: 'standby' },
              { key: 'track4', name: 'Track 4', color: '#ffd740', type: 'standby' },
              { key: 'inspection', name: 'IBL', color: '#ff1744', type: 'maintenance' },
              { key: 'maintenance_bays', name: 'Bays', color: '#00c2ff', type: 'active' },
              { key: 'maintenance_queue', name: 'Queue', color: '#ff6d00', type: 'waiting' },
            ].map((item) => {
              const count = layout[item.key]?.length ?? 0
              return (
                <div key={item.key} className="text-center">
                  <div className="font-mono text-xl font-bold" style={{ color: item.color }}>
                    {count}
                  </div>
                  <div className="font-display text-xs text-depot-muted">{item.name}</div>
                  <div className="font-display text-2xs text-depot-muted">{item.type}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedTrain && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="panel p-6 max-w-md w-full">
            <div className="text-lg font-bold mb-2 text-depot-white">
              {selectedTrain.name}
            </div>

            <div className="text-xs text-depot-muted mb-3">
              {selectedTrain.location}
            </div>

            <div className="mb-3">
              <div className="section-label mb-1">Maintenance Reason</div>
              <div className="font-mono text-xs">
                {selectedTrain.maintenance_reason}
              </div>
            </div>

            <div>
              <div className="section-label mb-1">Placement Reason</div>
              <div className="font-mono text-xs">
                {selectedTrain.placement_reason}
              </div>
            </div>

            <button
              onClick={() => setSelectedTrain(null)}
              className="btn btn-ghost mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}