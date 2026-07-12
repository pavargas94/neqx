import { DEFAULT_PLANTILLAS } from '../data/plantillasDefaults'
import { plantillasService } from '../services/plantillasService'

export function getFormPlantillaKeys() {
  const fromCache = Object.keys(plantillasService.getCache() || {})
    .filter(key => !key.startsWith('_'))
  if (fromCache.length > 0) return new Set(fromCache)
  return new Set(Object.keys(DEFAULT_PLANTILLAS).filter(key => !key.startsWith('_')))
}

export function getFormProceduresForEspecialidad(especialidad) {
  const keys = getFormPlantillaKeys()
  return (especialidad?.procedimientos || []).filter(
    proc => proc.activo !== false && keys.has(proc.key),
  )
}

export function findEspecialidadByProcedure(especialidades, procedureKey) {
  return (especialidades || []).find(esp =>
    esp.procedimientos?.some(
      proc => proc.key === procedureKey && proc.activo !== false,
    ),
  )
}

export function pickDefaultEspecialidadId(especialidades, preferredId) {
  if (preferredId && especialidades?.some(esp => esp.id === preferredId)) {
    return preferredId
  }
  return especialidades?.[0]?.id || ''
}

export function pickDefaultProcedureKey(especialidad, preferredKey) {
  const procedures = getFormProceduresForEspecialidad(especialidad)
  if (preferredKey && procedures.some(proc => proc.key === preferredKey)) {
    return preferredKey
  }
  return procedures[0]?.key || ''
}

/**
 * Agrupa plantillas de notas por especialidad médica.
 * Las plantillas sin procedimiento asignado quedan en sinCategoria.
 */
export function buildPlantillasPorEspecialidad(
  especialidades,
  plantillasData,
  { systemKeys = new Set(['_anestesia', '_config']), defaultKeys = new Set() } = {},
) {
  const plantillaKeys = new Set(
    Object.keys(plantillasData || {}).filter(key => !systemKeys.has(key) && !key.startsWith('_')),
  )

  const toProc = (key, nombre) => ({
    key,
    label: plantillasData[key]?.label || nombre || key,
    isDefault: defaultKeys.has(key),
  })

  const grupos = (especialidades || [])
    .map(esp => ({
      id: esp.id,
      nombre: esp.nombre,
      procedimientos: (esp.procedimientos || [])
        .filter(proc => proc.activo !== false && plantillaKeys.has(proc.key))
        .map(proc => toProc(proc.key, proc.nombre)),
    }))
    .filter(grupo => grupo.procedimientos.length > 0)

  const assigned = new Set(grupos.flatMap(grupo => grupo.procedimientos.map(proc => proc.key)))
  const sinCategoria = [...plantillaKeys]
    .filter(key => !assigned.has(key))
    .map(key => toProc(key))

  return { grupos, sinCategoria }
}
