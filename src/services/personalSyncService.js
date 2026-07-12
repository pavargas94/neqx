/**
 * Sincroniza cambios del panel admin hacia documentos individuales en personal/.
 */
import { TIPOS_PERSONAL } from '../data/firestoreCollections'
import { personalService } from '../services/personalService'
import {
  buildDesiredCirujanosMap,
  personalDocId,
} from '../utils/personalAdapter'

async function syncTipoSimple(tipo, nombres, extraFields = {}) {
  const trimmed = [...new Set(nombres.map(s => s.trim()).filter(Boolean))]
  const existing = await personalService.fetchByTipo(tipo)
  const existingByNombre = new Map(existing.map(doc => [doc.nombre, doc]))

  const ops = []

  for (const nombre of trimmed) {
    const payload = { nombre, tipo, rol: null, especialidadId: null, categorias: [], activo: true, ...extraFields }
    const found = existingByNombre.get(nombre)
    if (found) {
      ops.push(personalService.update(found.id, payload))
    } else {
      ops.push(personalService.upsert(personalDocId(tipo, nombre), payload))
    }
    existingByNombre.delete(nombre)
  }

  for (const doc of existingByNombre.values()) {
    ops.push(personalService.deactivate(doc.id))
  }

  await Promise.all(ops)
}

export const personalSyncService = {
  async syncCirujanos(cirujanosPorEspecialidad) {
    const desired = buildDesiredCirujanosMap(cirujanosPorEspecialidad)
    const existing = await personalService.fetchByTipo(TIPOS_PERSONAL.CIRUJANO)
    const existingByKey = new Map(
      existing.map(doc => [`${doc.especialidadId}::${doc.nombre}`, doc]),
    )

    const ops = []

    for (const [mapKey, data] of desired.entries()) {
      const found = existingByKey.get(mapKey)
      if (found) {
        ops.push(personalService.update(found.id, data))
      } else {
        ops.push(personalService.upsert(
          personalDocId(TIPOS_PERSONAL.CIRUJANO, data.nombre, data.especialidadId),
          data,
        ))
      }
      existingByKey.delete(mapKey)
    }

    for (const doc of existingByKey.values()) {
      ops.push(personalService.deactivate(doc.id))
    }

    await Promise.all(ops)
  },

  async syncAyudantes(items) {
    const filtered = items
      .map(item => ({
        nombre: item.value?.trim() || '',
        label: item.label?.trim() || item.value?.trim() || '',
      }))
      .filter(item => item.nombre && item.nombre !== 'No aplica')

    const existing = await personalService.fetchByTipo(TIPOS_PERSONAL.AYUDANTE)
    const existingByNombre = new Map(existing.map(doc => [doc.nombre, doc]))
    const ops = []

    for (const item of filtered) {
      const payload = {
        nombre: item.nombre,
        tipo: TIPOS_PERSONAL.AYUDANTE,
        rol: null,
        especialidadId: null,
        categorias: [],
        activo: true,
        label: item.label,
      }
      const found = existingByNombre.get(item.nombre)
      if (found) {
        ops.push(personalService.update(found.id, payload))
      } else {
        ops.push(personalService.upsert(personalDocId(TIPOS_PERSONAL.AYUDANTE, item.nombre), payload))
      }
      existingByNombre.delete(item.nombre)
    }

    for (const doc of existingByNombre.values()) {
      ops.push(personalService.deactivate(doc.id))
    }

    await Promise.all(ops)
  },

  async syncAnestesiologos(nombres) {
    await syncTipoSimple(TIPOS_PERSONAL.ANESTESIOLOGO, nombres)
  },

  async syncInstrumentadores(nombres) {
    await syncTipoSimple(TIPOS_PERSONAL.INSTRUMENTADOR, nombres)
  },
}
