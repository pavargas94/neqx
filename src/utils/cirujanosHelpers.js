import { ESPECIALIDADES } from '../data/especialidades'

function emptyEspecialidadLists() {
  return Object.fromEntries(
    ESPECIALIDADES.map(esp => [
      esp.key,
      Object.fromEntries(esp.cirugias.map(c => [c.key, []])),
    ]),
  )
}

export function buildCirujanosPorEspecialidadFromLegacy({ cirujanos = {}, segundosCirujanos = [] }) {
  const result = emptyEspecialidadLists()

  if (cirujanos.colelap?.length) result.general.colelap = [...cirujanos.colelap]
  if (cirujanos.histerectomia?.length) result.ginecologia.histerectomia = [...cirujanos.histerectomia]
  if (cirujanos.reemplazo?.length) result.ortopedia.reemplazo = [...cirujanos.reemplazo]
  if (segundosCirujanos.length) result.ortopedia.segundoCirujano = [...segundosCirujanos]

  return result
}

export function migrateCirujanosPorEspecialidad(data) {
  if (data.cirujanosPorEspecialidad) {
    return mergeWithEspecialidadStructure(data.cirujanosPorEspecialidad)
  }

  return buildCirujanosPorEspecialidadFromLegacy({
    cirujanos: data.cirujanos,
    segundosCirujanos: data.segundosCirujanos,
  })
}

function mergeWithEspecialidadStructure(existing) {
  const result = emptyEspecialidadLists()

  for (const esp of ESPECIALIDADES) {
    for (const cirugia of esp.cirugias) {
      const items = existing[esp.key]?.[cirugia.key]
      if (Array.isArray(items)) {
        result[esp.key][cirugia.key] = [...items]
      }
    }
  }

  return result
}

export function deriveCirujanosFlat(cirujanosPorEspecialidad) {
  const flat = {}

  for (const esp of ESPECIALIDADES) {
    for (const cirugia of esp.cirugias) {
      if (cirugia.formKey) {
        flat[cirugia.formKey] = [...(cirujanosPorEspecialidad[esp.key]?.[cirugia.key] || [])]
      }
    }
  }

  return flat
}

export function deriveSegundosCirujanos(cirujanosPorEspecialidad) {
  return [...(cirujanosPorEspecialidad.ortopedia?.segundoCirujano || [])]
}

export function cloneCirujanosPorEspecialidad(data) {
  const source = data || emptyEspecialidadLists()
  const result = emptyEspecialidadLists()

  for (const esp of ESPECIALIDADES) {
    for (const cirugia of esp.cirugias) {
      result[esp.key][cirugia.key] = [...(source[esp.key]?.[cirugia.key] || [])]
    }
  }

  return result
}

export function filterCirujanosPorEspecialidad(data) {
  const result = emptyEspecialidadLists()

  for (const esp of ESPECIALIDADES) {
    for (const cirugia of esp.cirugias) {
      result[esp.key][cirugia.key] = (data[esp.key]?.[cirugia.key] || [])
        .map(s => s.trim())
        .filter(Boolean)
    }
  }

  return result
}
