import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchFormConstants } from '../../store/constantsSlice'

export function usePersonalAdmin({ selectDraft, onSaveDraft }) {
  const dispatch = useDispatch()
  const [draft, setDraft] = useState(null)
  const [initialDraft, setInitialDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setSaveError(null)
      try {
        const result = await dispatch(fetchFormConstants()).unwrap()
        if (cancelled) return
        const nextDraft = selectDraft(result)
        setDraft(nextDraft)
        setInitialDraft(nextDraft)
      } catch (error) {
        if (!cancelled) {
          setSaveError(error.message || 'No se pudieron cargar los datos.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [dispatch, selectDraft])

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
      await onSaveDraft(draft)
      const result = await dispatch(fetchFormConstants()).unwrap()
      const nextDraft = selectDraft(result)
      setDraft(nextDraft)
      setInitialDraft(nextDraft)
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(initialDraft)
    setSaveError(null)
    setSaveSuccess(false)
  }

  return {
    draft,
    setDraft,
    loading,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    handleCancel,
  }
}
