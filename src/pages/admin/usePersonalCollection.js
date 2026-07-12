import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { TIPOS_PERSONAL } from '../../data/firestoreCollections'
import { personalService } from '../../services/personalService'
import { especialidadesService } from '../../services/especialidadesService'
import { fetchFormConstants } from '../../store/constantsSlice'
import { personalDocId } from '../../utils/personalAdapter'
import {
  normalizeAyudanteDraft,
  normalizeCirujanoDraft,
  normalizeSimpleDraft,
} from '../../utils/personalModel'

function cloneMembers(items) {
  return items.map(item => ({ ...item, categorias: [...(item.categorias || [])] }))
}

export function usePersonalCollection(tipo, { normalize } = {}) {
  const dispatch = useDispatch()
  const [members, setMembers] = useState([])
  const [initialMembers, setInitialMembers] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const [docs, esp] = await Promise.all([
        personalService.fetchByTipo(tipo),
        especialidadesService.fetchAll(),
      ])
      const cloned = cloneMembers(docs)
      setMembers(cloned)
      setInitialMembers(cloneMembers(docs))
      setEspecialidades(esp)
    } catch (error) {
      setSaveError(error.message || 'No se pudo cargar el personal.')
    } finally {
      setLoading(false)
    }
  }, [tipo])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const normalized = members
        .map(m => (normalize ? normalize(m, especialidades) : m))
        .filter(m => m.nombre)

      const existing = await personalService.fetchByTipo(tipo)
      const existingById = new Map(existing.map(doc => [doc.id, doc]))
      const ops = []

      for (const item of normalized) {
        const payload = {
          nombre: item.nombre,
          tipo,
          rol: item.rol ?? null,
          especialidadId: item.especialidadId ?? null,
          categorias: item.categorias ?? [],
          activo: true,
          ...(item.label ? { label: item.label } : {}),
        }

        if (item.id) {
          ops.push(personalService.update(item.id, payload))
          existingById.delete(item.id)
        } else {
          const id = personalDocId(tipo, item.nombre, item.especialidadId)
          ops.push(personalService.upsert(id, payload))
        }
      }

      for (const doc of existingById.values()) {
        ops.push(personalService.deactivate(doc.id))
      }

      await Promise.all(ops)
      await dispatch(fetchFormConstants())
      await load()
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setMembers(cloneMembers(initialMembers))
    setSaveError(null)
    setSaveSuccess(false)
  }

  return {
    members,
    setMembers,
    especialidades,
    loading,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    handleCancel,
    reload: load,
  }
}

export function useCirujanosCollection() {
  return usePersonalCollection(TIPOS_PERSONAL.CIRUJANO, {
    normalize: normalizeCirujanoDraft,
  })
}

export function useAyudantesCollection() {
  return usePersonalCollection(TIPOS_PERSONAL.AYUDANTE, {
    normalize: normalizeAyudanteDraft,
  })
}

export function useAnestesiologosCollection() {
  return usePersonalCollection(TIPOS_PERSONAL.ANESTESIOLOGO, {
    normalize: normalizeSimpleDraft,
  })
}

export function useInstrumentadoresCollection() {
  return usePersonalCollection(TIPOS_PERSONAL.INSTRUMENTADOR, {
    normalize: normalizeSimpleDraft,
  })
}
