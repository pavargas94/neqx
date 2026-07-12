import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Header from '../../components/Header'
import { clearSaveStatus, saveFormConstants } from '../../store/constantsSlice'

export default function AdminLayout() {
  return (
    <>
      <Header />
      <div className="admin-workspace admin-workspace-full">
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}

function filterEmptyStrings(items) {
  return items.map(s => s.trim()).filter(Boolean)
}

function filterLabeledItems(items) {
  return items
    .map(item => ({
      ...item,
      value: item.value?.trim() || '',
      label: item.label?.trim() || '',
    }))
    .filter(item => item.value && item.label)
}

export function useAdminSection(sectionKey, selectDraft) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const constants = useSelector(state => state.constants.data)
  const { saving, saveError, saveSuccess } = useSelector(state => state.constants)
  const [draft, setDraft] = useState(() => selectDraft(constants))

  useEffect(() => {
    setDraft(selectDraft(constants))
  }, [constants, selectDraft])

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => dispatch(clearSaveStatus()), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess, dispatch])

  async function handleSave(overrideDraft) {
    const dataToSave = overrideDraft !== undefined ? overrideDraft : draft
    const next = { ...constants, [sectionKey]: dataToSave }
    const result = await dispatch(saveFormConstants(next))
    if (saveFormConstants.rejected.match(result)) return
    setDraft(selectDraft({ ...constants, [sectionKey]: dataToSave }))
  }

  function handleCancel() {
    setDraft(selectDraft(constants))
    dispatch(clearSaveStatus())
  }

  return {
    draft,
    setDraft,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    handleCancel,
    navigate,
  }
}

export function AdminSectionActions({ saving, saveError, saveSuccess, onSave, onCancel }) {
  return (
    <div className="admin-actions">
      {saveError && <p className="admin-error">{saveError}</p>}
      {saveSuccess && <p className="admin-success">Cambios guardados en Firestore.</p>}
      <div className="admin-actions-buttons">
        <button type="button" className="btn-admin-secondary" onClick={onCancel} disabled={saving}>
          Descartar
        </button>
        <button type="button" className="btn-admin-save" onClick={onSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export { filterEmptyStrings, filterLabeledItems }
