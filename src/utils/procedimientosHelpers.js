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
