import { ESPECIALIDADES } from '../data/especialidades'

export function resolveEspecialidadesConfig(especialidadesList) {
  if (especialidadesList?.length > 0) return especialidadesList
  return ESPECIALIDADES.map(esp => ({
    id: esp.key,
    procedimientos: (esp.cirugias || []).map(c => ({
      key: c.key,
      nombre: c.label,
      activo: true,
    })),
  }))
}

export function buildEmptyCirujanosPorEspecialidad(especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  return Object.fromEntries(
    config.map(esp => [
      esp.id,
      Object.fromEntries(
        (esp.procedimientos || []).map(proc => [proc.key, []]),
      ),
    ]),
  )
}

export function buildCirujanosPorEspecialidadFromLegacy(
  { cirujanos = {}, segundosCirujanos = [] },
  especialidadesList,
) {
  const result = buildEmptyCirujanosPorEspecialidad(especialidadesList)

  if (cirujanos.colelap?.length) result.general.colelap = [...cirujanos.colelap]
  if (cirujanos.histerectomia?.length) result.ginecologia.histerectomia = [...cirujanos.histerectomia]
  if (cirujanos.reemplazo?.length) result.ortopedia.reemplazo = [...cirujanos.reemplazo]
  if (segundosCirujanos.length) result.ortopedia.segundoCirujano = [...segundosCirujanos]

  return result
}

export function migrateCirujanosPorEspecialidad(data, especialidadesList) {
  if (data.cirujanosPorEspecialidad) {
    return mergeWithEspecialidadStructure(data.cirujanosPorEspecialidad, especialidadesList)
  }

  return buildCirujanosPorEspecialidadFromLegacy({
    cirujanos: data.cirujanos,
    segundosCirujanos: data.segundosCirujanos,
  }, especialidadesList)
}

function mergeWithEspecialidadStructure(existing, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const result = buildEmptyCirujanosPorEspecialidad(config)

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      const items = existing[esp.id]?.[proc.key]
      if (Array.isArray(items)) {
        result[esp.id][proc.key] = [...items]
      }
    }
  }

  return result
}

export function getCirujanosLista(constants, especialidadId, procedureKey) {
  const porEsp = constants?.cirujanosPorEspecialidad || {}
  const fromEsp = porEsp[especialidadId]?.[procedureKey]
  if (Array.isArray(fromEsp) && fromEsp.length > 0) return fromEsp
  return constants?.cirujanos?.[procedureKey] || []
}

export function pickDefaultCirujano(constants, especialidadId, procedureKey, preferred) {
  const lista = getCirujanosLista(constants, especialidadId, procedureKey)
  if (preferred && lista.includes(preferred)) return preferred
  return lista[0] || ''
}

export function deriveCirujanosFlat(cirujanosPorEspecialidad, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const flat = {}

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      if (proc.activo === false) continue
      flat[proc.key] = [...(cirujanosPorEspecialidad[esp.id]?.[proc.key] || [])]
    }
  }

  return flat
}

export function deriveSegundosCirujanos(cirujanosPorEspecialidad) {
  return [...(cirujanosPorEspecialidad.ortopedia?.segundoCirujano || [])]
}

export function cloneCirujanosPorEspecialidad(data, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const source = data || buildEmptyCirujanosPorEspecialidad(config)
  const result = buildEmptyCirujanosPorEspecialidad(config)

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      result[esp.id][proc.key] = [...(source[esp.id]?.[proc.key] || [])]
    }
  }

  return result
}

export function filterCirujanosPorEspecialidad(data, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const result = buildEmptyCirujanosPorEspecialidad(config)

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      result[esp.id][proc.key] = (data[esp.id]?.[proc.key] || [])
        .map(s => s.trim())
        .filter(Boolean)
    }
  }

  return result
}
