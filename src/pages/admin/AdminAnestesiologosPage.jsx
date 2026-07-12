import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StringListEditor from '../../components/admin/StringListEditor'
import {
  AdminSectionActions,
  filterEmptyStrings,
  useAdminSection,
} from './AdminLayout'

export default function AdminAnestesiologosPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => [...(data.anestesiologos || [])], [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('anestesiologos', selectDraft)

  function onSave() {
    handleSave(filterEmptyStrings(draft))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Anestesiólogos</h2>
          <p>Lista del personal de anestesia en sala.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <StringListEditor
        title="Anestesiólogos"
        items={draft}
        placeholder="Nombre del anestesiólogo"
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
