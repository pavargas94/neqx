import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StringListEditor from '../../components/admin/StringListEditor'
import {
  AdminSectionActions,
  filterEmptyStrings,
  useAdminSection,
} from './AdminLayout'

export default function AdminSegundosCirujanosPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => [...(data.segundosCirujanos || [])], [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('segundosCirujanos', selectDraft)

  function onSave() {
    handleSave(filterEmptyStrings(draft))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Segundos cirujanos</h2>
          <p>Ortopedistas para reemplazo de rodilla.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <StringListEditor
        title="Segundos cirujanos"
        items={draft}
        placeholder="Nombre del cirujano"
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
