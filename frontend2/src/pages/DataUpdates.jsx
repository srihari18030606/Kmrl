// src/pages/DataUpdates.jsx
import { useState, useEffect, useRef } from 'react'
import {
  getTrains, uploadBranding, maiximoUpdate,
  iotUpdate, cleaningUpdate
} from '../api/api'
import { Spinner, StatusDot } from '../components/ui/index'
import {
  Tag, Wrench, Cpu, Droplets,
  ChevronDown, CheckCircle, XCircle, Upload, X
} from 'lucide-react'

// ─── Reusable Train Dropdown ─────────────────────────────
function TrainDropdown({ trains, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = trains.find(t => t.name === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full bg-depot-bg border border-depot-border rounded-sm px-3 py-2 font-mono text-sm hover:border-depot-accent transition-colors"
        style={{ color: 'var(--depot-text)' }}
      >
        <span>{value || 'Select a train…'}</span>
        <ChevronDown size={14} style={{ color: 'var(--depot-muted)' }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-depot-panel border border-depot-border rounded-sm z-50 shadow-xl max-h-48 overflow-y-auto">
          {trains.map(t => (
            <button
              key={t.name}
              onClick={() => { onChange(t.name); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 font-mono text-xs transition-colors hover:bg-depot-dim flex items-center justify-between"
              style={{
                color: value === t.name ? 'var(--depot-accent)' : 'var(--depot-text)',
                background: value === t.name ? 'var(--depot-dim)' : 'transparent'
              }}
            >
              <span>{t.name}</span>
              <span style={{ color: 'var(--depot-muted)' }}>{t.mileage?.toLocaleString()} km</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Result Message ───────────────────────────────────────
function ResultMsg({ msg }) {
  if (!msg) return null
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-sm border font-mono text-xs ${
      msg.ok
        ? 'border-depot-green/40 text-depot-green'
        : 'border-depot-red/40 text-depot-red'
    }`} style={{ background: msg.ok ? 'rgba(0,230,118,0.05)' : 'rgba(255,23,68,0.05)' }}>
      {msg.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {msg.text}
    </div>
  )
}

// ─── Field Input ──────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="section-label mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-depot-bg border border-depot-border rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-depot-accent transition-colors"
      style={{ color: 'var(--depot-text)' }}
    />
  )
}

function Toggle({ value, onChange, labelOn, labelOff }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 btn text-xs ${value === true ? 'btn-success' : 'btn-ghost'}`}
      >
        {labelOn}
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 btn text-xs ${value === false ? 'btn-danger' : 'btn-ghost'}`}
      >
        {labelOff}
      </button>
    </div>
  )
}

// ─── PANEL: Branding CSV Upload ───────────────────────────
function BrandingPanel({ onClose }) {
  const fileRef = useRef()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [fileName, setFileName] = useState('')

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    setMsg(null)
    try {
      const res = await uploadBranding(file)
      setMsg({ ok: true, text: `${res.updated_trains} trains updated. ${res.unknown_trains?.length ?? 0} unknown.` })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
    setLoading(false)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--depot-muted)' }}>
        Upload a CSV file to update branding contract data for multiple trains at once.
        Required columns: <span className="font-mono text-depot-accent">name, is_branded, contract_total_exposure, exposure_achieved, contract_days_remaining</span>
      </p>

      {/* CSV format example */}
      <div className="rounded-sm p-3 border" style={{ background: 'var(--depot-bg)', borderColor: 'var(--depot-border)' }}>
        <div className="section-label mb-2">Example CSV Format</div>
        <pre className="font-mono text-xs" style={{ color: 'var(--depot-accent)' }}>
{`name,is_branded,contract_total_exposure,exposure_achieved,contract_days_remaining
T-1,1,100,40,10
T-2,0,0,0,0
T-3,1,80,20,5`}
        </pre>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
        style={{ borderColor: 'var(--depot-border)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--depot-accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--depot-border)'}
      >
        <Upload size={24} style={{ color: 'var(--depot-accent)' }} className="mb-2" />
        <span className="font-display font-semibold text-sm" style={{ color: 'var(--depot-text)' }}>
          {fileName || 'Click to select CSV file'}
        </span>
        <span className="font-body text-xs mt-1" style={{ color: 'var(--depot-muted)' }}>
          .csv files only
        </span>
      </div>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handle} />

      {loading && (
        <div className="flex items-center gap-2">
          <Spinner size={14} />
          <span className="font-mono text-xs" style={{ color: 'var(--depot-muted)' }}>Uploading…</span>
        </div>
      )}

      <ResultMsg msg={msg} />
    </div>
  )
}

// ─── PANEL: Maximo Update ─────────────────────────────────
function MaximoPanel({ trains, onClose }) {
  const [train, setTrain]       = useState('')
  const [fitnessRs, setFitnessRs]         = useState(null)
  const [fitnessSig, setFitnessSig]       = useState(null)
  const [fitnessTel, setFitnessTel]       = useState(null)
  const [rsExpiry, setRsExpiry]           = useState('')
  const [sigExpiry, setSigExpiry]         = useState('')
  const [telExpiry, setTelExpiry]         = useState('')
  const [openJobCard, setOpenJobCard]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState(null)

  const submit = async () => {
    if (!train) return
    setLoading(true)
    setMsg(null)
    const payload = { train_name: train }
    if (fitnessRs   !== null) payload.fitness_rs          = fitnessRs
    if (fitnessSig  !== null) payload.fitness_signalling  = fitnessSig
    if (fitnessTel  !== null) payload.fitness_telecom     = fitnessTel
    if (openJobCard !== null) payload.open_job_card       = openJobCard
    if (rsExpiry  !== '') payload.fitness_rs_expiry_days          = parseInt(rsExpiry)
    if (sigExpiry !== '') payload.fitness_signalling_expiry_days  = parseInt(sigExpiry)
    if (telExpiry !== '') payload.fitness_telecom_expiry_days     = parseInt(telExpiry)

    try {
      await maiximoUpdate(payload)
      setMsg({ ok: true, text: `Maximo data updated for ${train}` })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Field label="Select Train">
        <TrainDropdown trains={trains} value={train} onChange={setTrain} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Rolling Stock Fitness">
          <Toggle value={fitnessRs} onChange={setFitnessRs} labelOn="Valid" labelOff="Invalid" />
        </Field>
        <Field label="RS Expiry (days)">
          <TextInput value={rsExpiry} onChange={setRsExpiry} placeholder="e.g. 14" type="number" />
        </Field>

        <Field label="Signalling Fitness">
          <Toggle value={fitnessSig} onChange={setFitnessSig} labelOn="Valid" labelOff="Invalid" />
        </Field>
        <Field label="Signalling Expiry (days)">
          <TextInput value={sigExpiry} onChange={setSigExpiry} placeholder="e.g. 14" type="number" />
        </Field>

        <Field label="Telecom Fitness">
          <Toggle value={fitnessTel} onChange={setFitnessTel} labelOn="Valid" labelOff="Invalid" />
        </Field>
        <Field label="Telecom Expiry (days)">
          <TextInput value={telExpiry} onChange={setTelExpiry} placeholder="e.g. 14" type="number" />
        </Field>
      </div>

      <Field label="Open Job Card (Maximo)">
        <Toggle value={openJobCard} onChange={setOpenJobCard} labelOn="Open" labelOff="Closed" />
      </Field>

      <button
        onClick={submit}
        disabled={loading || !train}
        className="w-full btn btn-primary"
      >
        {loading ? <Spinner size={13} /> : <Wrench size={13} />}
        Submit Maximo Update
      </button>

      <ResultMsg msg={msg} />
    </div>
  )
}

// ─── PANEL: IoT Update ────────────────────────────────────
function IoTPanel({ trains, onClose }) {
  const [train, setTrain]           = useState('')
  const [mileage, setMileage]       = useState('')
  const [sensorAlert, setSensorAlert] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [msg, setMsg]               = useState(null)

  const submit = async () => {
    if (!train) return
    setLoading(true)
    setMsg(null)
    const payload = { train_name: train }
    if (mileage !== '')      payload.mileage       = parseFloat(mileage)
    if (sensorAlert !== null) payload.sensor_alert = sensorAlert

    try {
      await iotUpdate(payload)
      setMsg({ ok: true, text: `IoT data updated for ${train}` })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Field label="Select Train">
        <TrainDropdown trains={trains} value={train} onChange={setTrain} />
      </Field>

      <Field label="Mileage (km)">
        <TextInput
          value={mileage}
          onChange={setMileage}
          placeholder="e.g. 18500"
          type="number"
        />
      </Field>

      <Field label="Sensor Alert Status">
        <Toggle
          value={sensorAlert}
          onChange={setSensorAlert}
          labelOn="Alert Active"
          labelOff="Nominal"
        />
      </Field>

      {sensorAlert === true && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-sm border border-depot-red/40"
          style={{ background: 'rgba(255,23,68,0.06)' }}>
          <XCircle size={13} className="text-depot-red mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-depot-red leading-snug">
            Setting sensor alert to Active will force this train into maintenance on next induction run.
          </p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !train}
        className="w-full btn btn-primary"
      >
        {loading ? <Spinner size={13} /> : <Cpu size={13} />}
        Submit IoT Update
      </button>

      <ResultMsg msg={msg} />
    </div>
  )
}

// ─── PANEL: Cleaning Update ───────────────────────────────
function CleaningPanel({ trains, onClose }) {
  const [train, setTrain]   = useState('')
  const [days, setDays]     = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState(null)

  const submit = async () => {
    if (!train || days === '') return
    setLoading(true)
    setMsg(null)
    try {
      await cleaningUpdate({ train_name: train, days_since_cleaning: parseInt(days) })
      setMsg({ ok: true, text: `Cleaning data updated for ${train}` })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
    setLoading(false)
  }

  const d = parseInt(days)
  const hygieneLabel =
    d >= 9 ? { text: 'CRITICAL', color: '#ff1744' } :
    d >= 6 ? { text: 'DIRTY',    color: '#ff6d00' } :
    d >= 3 ? { text: 'MILD',     color: '#ffd740' } :
    !isNaN(d) ? { text: 'CLEAN', color: '#00e676' } : null

  return (
    <div className="space-y-4">
      <Field label="Select Train">
        <TrainDropdown trains={trains} value={train} onChange={setTrain} />
      </Field>

      <Field label="Days Since Last Cleaning (0 – 30)">
        <TextInput
          value={days}
          onChange={setDays}
          placeholder="e.g. 4"
          type="number"
        />
      </Field>

      {hygieneLabel && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-sm border"
          style={{ borderColor: `${hygieneLabel.color}44`, background: `${hygieneLabel.color}0d` }}>
          <StatusDot
            color={hygieneLabel.text === 'CLEAN' ? 'green' : hygieneLabel.text === 'MILD' ? 'yellow' : 'red'}
            pulse
          />
          <span className="font-display font-bold text-xs tracking-widest" style={{ color: hygieneLabel.color }}>
            Hygiene Level: {hygieneLabel.text}
          </span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !train || days === ''}
        className="w-full btn btn-primary"
      >
        {loading ? <Spinner size={13} /> : <Droplets size={13} />}
        Submit Cleaning Update
      </button>

      <ResultMsg msg={msg} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
const CARDS = [
  {
    id: 'branding',
    icon: Tag,
    label: 'Upload Branding CSV',
    sub: 'Bulk update branding contract data',
    color: '#00c2ff',
    border: 'rgba(0,194,255,0.25)',
    bg: 'rgba(0,194,255,0.05)',
  },
  {
    id: 'maximo',
    icon: Wrench,
    label: 'Maximo Update',
    sub: 'Update job card & fitness certificates',
    color: '#ffd740',
    border: 'rgba(255,215,64,0.25)',
    bg: 'rgba(255,215,64,0.05)',
  },
  {
    id: 'iot',
    icon: Cpu,
    label: 'IoT Update',
    sub: 'Update sensor alerts & mileage',
    color: '#00e676',
    border: 'rgba(0,230,118,0.25)',
    bg: 'rgba(0,230,118,0.05)',
  },
  {
    id: 'cleaning',
    icon: Droplets,
    label: 'Cleaning Update',
    sub: 'Update days since last cleaning',
    color: '#ff6d00',
    border: 'rgba(255,109,0,0.25)',
    bg: 'rgba(255,109,0,0.05)',
  },
]

export default function DataUpdates() {
  const [active, setActive] = useState(null)
  const [trains, setTrains] = useState([])
  const [loadingTrains, setLoadingTrains] = useState(false)

  useEffect(() => {
    setLoadingTrains(true)
    getTrains()
      .then(setTrains)
      .catch(() => {})
      .finally(() => setLoadingTrains(false))
  }, [])

  const activeCard = CARDS.find(c => c.id === active)

  const renderPanel = () => {
    if (!active) return null
    if (active === 'branding') return <BrandingPanel onClose={() => setActive(null)} />
    if (active === 'maximo')   return <MaximoPanel   trains={trains} onClose={() => setActive(null)} />
    if (active === 'iot')      return <IoTPanel      trains={trains} onClose={() => setActive(null)} />
    if (active === 'cleaning') return <CleaningPanel trains={trains} onClose={() => setActive(null)} />
  }

  return (
    <div>
      <div className="section-label mb-4">Select an update type to proceed</div>

      {/* 4 cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {CARDS.map(card => {
          const Icon = card.icon
          const isActive = active === card.id
          return (
            <button
              key={card.id}
              onClick={() => setActive(isActive ? null : card.id)}
              className="panel p-5 text-left transition-all duration-200 hover:scale-[1.01]"
              style={{
                borderColor: isActive ? card.color : card.border,
                background: isActive ? card.bg : 'var(--depot-panel)',
                boxShadow: isActive ? `0 0 20px ${card.color}22` : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}44` }}
                >
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                {isActive && (
                  <span
                    className="font-display font-bold text-2xs tracking-widest px-2 py-0.5 rounded-sm border"
                    style={{ color: card.color, borderColor: card.color, background: `${card.color}15` }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="font-display font-bold text-base tracking-wide"
                style={{ color: isActive ? card.color : 'var(--depot-white)' }}>
                {card.label}
              </div>
              <div className="font-body text-xs mt-1" style={{ color: 'var(--depot-muted)' }}>
                {card.sub}
              </div>
            </button>
          )
        })}
      </div>

      {/* Expandable panel */}
      {active && activeCard && (
        <div
          className="panel p-6 transition-all duration-200"
          style={{ borderColor: activeCard.color, background: activeCard.bg }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center"
                style={{ background: `${activeCard.color}18`, border: `1px solid ${activeCard.color}44` }}
              >
                <activeCard.icon size={16} style={{ color: activeCard.color }} />
              </div>
              <div>
                <div className="font-display font-bold text-sm tracking-wide"
                  style={{ color: activeCard.color }}>
                  {activeCard.label}
                </div>
                <div className="font-body text-xs" style={{ color: 'var(--depot-muted)' }}>
                  {activeCard.sub}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActive(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm border transition-colors hover:border-depot-accent"
              style={{ borderColor: 'var(--depot-border)', color: 'var(--depot-muted)' }}
            >
              <X size={13} />
            </button>
          </div>

          {loadingTrains ? (
            <div className="flex items-center gap-2 py-4">
              <Spinner size={16} />
              <span className="font-mono text-xs" style={{ color: 'var(--depot-muted)' }}>
                Loading trains…
              </span>
            </div>
          ) : (
            renderPanel()
          )}
        </div>
      )}
    </div>
  )
}