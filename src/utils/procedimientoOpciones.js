import { FLAGS_DEFAULTS, OPCIONES_DEFAULTS } from '../data/procedimientoOpcionesDefaults'

const VALORES_NO_APLICA = new Set([
  'no_aplica',
  'no aplica',
  'ninguno',
  'n/a',
  'na',
])

/** Indica si un valor de opción debe mostrarse en la nota (no vacío ni "no aplica"). */
export function isOpcionAplicable(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized !== '' && !VALORES_NO_APLICA.has(normalized)
}

export function findProcedimientoByKey(especialidades, procedureKey) {
  for (const esp of especialidades || []) {
    const proc = esp.procedimientos?.find(
      p => p.key === procedureKey && p.activo !== false,
    )
    if (proc) return proc
  }
  return null
}

export function mergeProcedimientoConfig(proc) {
  if (!proc?.key) return { opciones: [], flags: {} }
  return {
    ...proc,
    opciones: proc.opciones?.length
      ? proc.opciones
      : (OPCIONES_DEFAULTS[proc.key] || []),
    flags: {
      ...(FLAGS_DEFAULTS[proc.key] || {}),
      ...(proc.flags || {}),
    },
  }
}

/** Normaliza procedimientos al cargar especialidades (Firestore o local). */
export function normalizeProcedimiento(proc) {
  return mergeProcedimientoConfig(proc)
}

export function normalizeEspecialidadesList(especialidades) {
  return (especialidades || []).map(esp => ({
    ...esp,
    procedimientos: (esp.procedimientos || []).map(normalizeProcedimiento),
  }))
}

export function getProcedimientoConfig(especialidades, procedureKey) {
  if (!procedureKey) return { key: '', opciones: [], flags: {} }
  const proc = findProcedimientoByKey(especialidades, procedureKey)
  return mergeProcedimientoConfig(proc ?? { key: procedureKey })
}

export function resolveOpcionDefaultValue(opt) {
  const explicit = opt.default
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).trim()
  }
  if (opt.tipo === 'select') {
    return opt.opciones?.[0]?.value ?? ''
  }
  return ''
}

function resolveOpcionRawValue(opcionesProcedimiento, opt) {
  const stored = opcionesProcedimiento?.[opt.id]
  if (stored != null && String(stored).trim() !== '') {
    return String(stored).trim()
  }
  return resolveOpcionDefaultValue(opt)
}

function buildOpcionTextoNarrativo(opt, selected, raw) {
  const texto = selected?.texto?.trim()
  if (texto) return texto

  const rawStr = String(raw ?? '').trim()
  if (!rawStr || rawStr === 'no_aplica') return ''

  const label = selected?.label?.trim()
  if (label) {
    if (opt.id?.includes('lateralidad')) {
      return ` ${label.toLowerCase()}`
    }
    if (opt.id?.includes('hernia') || opt.id?.includes('tipo_')) {
      return label.toLowerCase()
    }
    return label
  }

  return rawStr.replace(/_/g, ' ')
}

export function getDefaultOpciones(opcionesConfig = []) {
  const result = {}
  for (const opt of opcionesConfig) {
    if (!opt.id) continue
    result[opt.id] = resolveOpcionDefaultValue(opt)
  }
  return result
}

function findOpcionSelectItem(items, raw) {
  const normalized = String(raw ?? '')
  return items?.find(
    item => String(item.value ?? '') === normalized,
  )
}

export function resolveOpcionesContext(opcionesProcedimiento = {}, opcionesConfig = []) {
  const ctx = {
    ...(opcionesProcedimiento || {}),
  }

  for (const opt of opcionesConfig) {
    if (!opt.id) continue

    const raw = resolveOpcionRawValue(opcionesProcedimiento, opt)
    ctx[opt.id] = raw

    if (opt.tipo === 'select' && opt.opciones?.length) {
      const selected = findOpcionSelectItem(opt.opciones, raw)
      ctx[`${opt.id}Texto`] = buildOpcionTextoNarrativo(opt, selected, raw)
    }
  }

  return ctx
}

export function groupOpciones(opcionesConfig = []) {
  const sorted = [...opcionesConfig].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  const grupos = new Map()
  for (const opt of sorted) {
    const grupo = opt.grupo || ''
    if (!grupos.has(grupo)) grupos.set(grupo, [])
    grupos.get(grupo).push(opt)
  }
  return [...grupos.entries()]
}
