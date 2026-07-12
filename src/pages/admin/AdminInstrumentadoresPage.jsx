import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StringListEditor from '../../components/admin/StringListEditor'
import {
  AdminSectionActions,
  filterEmptyStrings,
  useAdminSection,
} from './AdminLayout'

export default function AdminInstrumentadoresPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => [...(data.instrumentadores || [])], [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('instrumentadores', selectDraft)

  function onSave() {
    handleSave(filterEmptyStrings(draft))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Instrumentadores</h2>
          <p>Personal de instrumentación quirúrgica.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <StringListEditor
        title="Instrumentadores"
        items={draft}
        placeholder="Nombre del instrumentador"
        onChange={setDraft}
      />
      <AdminSectionActions
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onSave={onSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
