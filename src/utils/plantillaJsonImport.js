const SECCION_KEYS = ['ingreso', 'lavado', 'inicio', 'medicacion', 'final', 'traslado']
const SUFIJO_KEYS = ['raquidea', 'general', 'fallo_raquidea']

export function parsePlantillaJson(raw) {
  if (!raw?.trim()) {
    return { error: 'Pega un JSON con la plantilla.' }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'JSON inválido. Revisa comas, comillas y llaves.' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'El JSON debe ser un objeto.' }
  }

  const secciones = parsed.secciones
  if (!secciones || typeof secciones !== 'object' || Array.isArray(secciones)) {
    return { error: 'Falta el objeto "secciones".' }
  }

  const missing = SECCION_KEYS.filter(key => typeof secciones[key] !== 'string' || !secciones[key].trim())
  if (missing.length > 0) {
    return { error: `Faltan secciones o están vacías: ${missing.join(', ')}` }
  }

  const normalized = {
    secciones: Object.fromEntries(
      SECCION_KEYS.map(key => [key, secciones[key].trim()]),
    ),
    sufijoAnestesia: {},
  }

  if (parsed.sufijoAnestesia && typeof parsed.sufijoAnestesia === 'object') {
    for (const key of SUFIJO_KEYS) {
      if (typeof parsed.sufijoAnestesia[key] === 'string') {
        normalized.sufijoAnestesia[key] = parsed.sufijoAnestesia[key].trim()
      }
    }
  }

  if (typeof parsed.label === 'string' && parsed.label.trim()) {
    normalized.label = parsed.label.trim()
  }

  if (typeof parsed.procedimientoKey === 'string' && parsed.procedimientoKey.trim()) {
    normalized.procedimientoKey = parsed.procedimientoKey.trim()
  }

  return { data: normalized }
}

export function mergePlantillaImport(current, imported) {
  return {
    ...current,
    ...(imported.label ? { label: imported.label } : {}),
    procedimientoKey: current?.procedimientoKey || imported.procedimientoKey,
    secciones: imported.secciones,
    sufijoAnestesia: {
      ...(current?.sufijoAnestesia ?? {}),
      ...imported.sufijoAnestesia,
    },
  }
}

export const PLANTILLA_JSON_EJEMPLO = `{
  "procedimientoKey": "colelap",
  "label": "Colecistectomía laparoscópica",
  "sufijoAnestesia": {
    "raquidea": "regional raquídea",
    "general": "general",
    "fallo_raquidea": "general secundaria a conversión por fallo de anestesia raquídea"
  },
  "secciones": {
    "ingreso": "{{h1}} Nota de ingreso...",
    "lavado": "{{h3}} Lavado quirúrgico...",
    "inicio": "{{h4}} Inicio de cirugía...",
    "medicacion": "{{h5}} Medicación...",
    "final": "{{h6}} Final de cirugía...",
    "traslado": "{{h7}} Traslado a recuperación..."
  }
}`
