import { DEFAULT_CONSTANTS } from '../data/constants'
import { TIPOS_PERSONAL } from '../data/firestoreCollections'
import {
  buildEmptyCirujanosPorEspecialidad,
  deriveCirujanosFlat,
  deriveSegundosCirujanos,
  resolveEspecialidadesConfig,
} from './cirujanosHelpers'

const CATEGORIA_POR_CIRUGIA = {
  segundoCirujano: 'Segundo Cirujano',
  reemplazo: 'Reemplazo articular',
  artroscopia: 'Artroscopista',
}

function dedupeCirujanosPorEspecialidad(data, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const result = buildEmptyCirujanosPorEspecialidad(config)

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      result[esp.id][proc.key] = [
        ...new Set((data[esp.id]?.[proc.key] || []).map(s => s.trim()).filter(Boolean)),
      ]
    }
  }

  return result
}

export function buildCirujanosPorEspecialidadFromPersonal(personalDocs, especialidadesList) {
  const config = resolveEspecialidadesConfig(especialidadesList)
  const result = buildEmptyCirujanosPorEspecialidad(config)
  const cirujanos = personalDocs.filter(p => p.tipo === TIPOS_PERSONAL.CIRUJANO)

  for (const item of cirujanos) {
    const espKey = item.especialidadId
    const nombre = item.nombre?.trim()
    if (!nombre || !espKey || !result[espKey]) continue

    if (espKey === 'ortopedia') {
      const categorias = item.categorias || []
      if (categorias.includes('Reemplazo articular') && result.ortopedia.reemplazo) {
        result.ortopedia.reemplazo.push(nombre)
      }
      if (categorias.includes('Segundo Cirujano') && result.ortopedia.segundoCirujano) {
        result.ortopedia.segundoCirujano.push(nombre)
      }
      if (categorias.includes('Artroscopista') && result.ortopedia.artroscopia) {
        result.ortopedia.artroscopia.push(nombre)
      }
    } else {
      const esp = config.find(e => e.id === espKey)
      for (const proc of esp?.procedimientos || []) {
        if (proc.activo === false) continue
        if (result[espKey][proc.key]) {
          result[espKey][proc.key].push(nombre)
        }
      }
    }
  }

  return dedupeCirujanosPorEspecialidad(result, config)
}

export function deriveProcedureMetadata(especialidadesList) {
  const labelCirujano = { ...DEFAULT_CONSTANTS.labelCirujano }
  const muestrasDefault = { ...DEFAULT_CONSTANTS.muestrasDefault }

  for (const esp of especialidadesList || []) {
    for (const proc of esp.procedimientos || []) {
      if (proc.activo === false) continue
      if (proc.labelCirujano) labelCirujano[proc.key] = proc.labelCirujano
      if (proc.muestraDefault) muestrasDefault[proc.key] = proc.muestraDefault
    }
  }

  return { labelCirujano, muestrasDefault }
}

export function buildAyudantesFromPersonal(personalDocs) {
  const ayudantes = personalDocs
    .filter(p => p.tipo === TIPOS_PERSONAL.AYUDANTE)
    .map(p => ({
      value: p.nombre,
      label: p.label || p.nombre,
    }))

  if (!ayudantes.some(a => a.value === 'No aplica')) {
    ayudantes.unshift({ value: 'No aplica', label: '(No aplica)' })
  }

  return ayudantes
}

export function buildFormConstantsFromPersonal(personalDocs, especialidadesList, medicacionData = {}) {
  const cirujanosPorEspecialidad = buildCirujanosPorEspecialidadFromPersonal(
    personalDocs,
    especialidadesList,
  )
  const { labelCirujano, muestrasDefault } = deriveProcedureMetadata(especialidadesList)

  return {
    cirujanosPorEspecialidad,
    cirujanos: deriveCirujanosFlat(cirujanosPorEspecialidad, especialidadesList),
    segundosCirujanos: deriveSegundosCirujanos(cirujanosPorEspecialidad),
    ayudantes: buildAyudantesFromPersonal(personalDocs),
    anestesiologos: personalDocs
      .filter(p => p.tipo === TIPOS_PERSONAL.ANESTESIOLOGO)
      .map(p => p.nombre)
      .filter(Boolean),
    instrumentadores: personalDocs
      .filter(p => p.tipo === TIPOS_PERSONAL.INSTRUMENTADOR)
      .map(p => p.nombre)
      .filter(Boolean),
    labelCirujano,
    muestrasDefault,
    medicamentosLista:
      medicacionData.medicamentosLista ?? DEFAULT_CONSTANTS.medicamentosLista,
    especialidades: especialidadesList,
  }
}

/**
 * Convierte el draft del editor legado (cirujanosPorEspecialidad)
 * al mapa de documentos cirujano deseado en personal/.
 */
export function buildDesiredCirujanosMap(cirujanosPorEspecialidad, especialidadesList) {
  const desired = new Map()
  const config = resolveEspecialidadesConfig(especialidadesList)

  for (const esp of config) {
    for (const proc of esp.procedimientos || []) {
      const nombres = cirujanosPorEspecialidad[esp.id]?.[proc.key] || []
      const categoria = CATEGORIA_POR_CIRUGIA[proc.key]

      for (const nombreRaw of nombres) {
        const nombre = nombreRaw.trim()
        if (!nombre) continue

        const mapKey = `${esp.id}::${nombre}`
        const existing = desired.get(mapKey) || {
          nombre,
          tipo: TIPOS_PERSONAL.CIRUJANO,
          rol: esp.rolNombre || esp.nombre || '',
          especialidadId: esp.id,
          categorias: [],
          activo: true,
        }

        if (categoria && !existing.categorias.includes(categoria)) {
          existing.categorias.push(categoria)
        }

        desired.set(mapKey, existing)
      }
    }
  }

  return desired
}

export function slugifyPersonalId(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function personalDocId(tipo, nombre, especialidadId = null) {
  if (tipo === TIPOS_PERSONAL.CIRUJANO && especialidadId) {
    return `${tipo}_${slugifyPersonalId(especialidadId)}_${slugifyPersonalId(nombre)}`
  }
  return `${tipo}_${slugifyPersonalId(nombre)}`
}
