// src/api/api.js
// Central API service layer — all calls to FastAPI backend

const BASE = '/api'

async function request(method, path, body = null, isFormData = false) {
  const opts = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  }
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Trains ──────────────────────────────────────────────
export const getTrains          = ()             => request('GET',    '/trains')
export const addTrain           = (data)         => request('POST',   '/trains', data)
export const resetDatabase      = ()             => request('DELETE', '/reset-database')
export const populateDatabase   = ()             => request('POST',   '/populate-database')

// ─── Induction ───────────────────────────────────────────
export const generateInduction  = (level = 3)   => request('GET',    `/generate-induction?traffic_level=${level}`)
export const simulateInduction  = (payload)     => request('POST',   '/simulate-induction', payload)

// ─── Overrides / Updates ─────────────────────────────────
export const supervisorUpdate   = (data)         => request('PATCH',  '/supervisor-update', data)
export const maiximoUpdate      = (data)         => request('PATCH',  '/maximo-update', data)
export const iotUpdate          = (data)         => request('PATCH',  '/iot-update', data)
export const cleaningUpdate     = (data)         => request('PATCH',  '/cleaning-update', data)

// ─── Branding CSV ─────────────────────────────────────────
export const uploadBranding = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request('POST', '/upload-branding', form, true)
}

// ─── Depot & Layout ──────────────────────────────────────
export const getDepotLayout     = ()             => request('GET',    '/depot-layout')
export const getDepotSummary    = ()             => request('GET',    '/depot-summary')

// ─── Cleaning ────────────────────────────────────────────
export const getCleaningPlan    = ()             => request('GET',    '/cleaning-plan')

// ─── Alerts & Health ─────────────────────────────────────
export const getAlerts          = ()             => request('GET',    '/alerts')
export const getFleetHealth     = ()             => request('GET',    '/fleet-health')

// ─── History ─────────────────────────────────────────────
export const getInductionLogs   = ()             => request('GET',    '/induction-logs')

// ─── Metrics ─────────────────────────────────────────────
export const getResourceUtil    = ()             => request('GET',    '/resource-utilization')
export const getShuntingIndex   = ()             => request('GET',    '/shunting-index')
export const getDailyReport     = ()             => request('GET',    '/daily-report')

// ─── Decision Breakdown ───────────────────────────────────
export const getDecisionBreakdown = (name)       => request('GET',    `/decision-breakdown/${name}`)