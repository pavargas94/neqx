import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LabeledListEditor from '../../components/admin/LabeledListEditor'
import {
  AdminSectionActions,
  filterLabeledItems,
  useAdminSection,
} from './AdminLayout'

export default function AdminAyudantesPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(
    data => (data.ayudantes || []).map(item => ({ ...item })),
    [],
  )

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('ayudantes', selectDraft)

  function onSave() {
    handleSave(filterLabeledItems(draft))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Médicos ayudantes</h2>
          <p>Opciones del select de ayudante en el formulario.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <LabeledListEditor
        title="Lista de ayudantes"
        description="El valor es lo que se guarda en la nota; la etiqueta es lo que ve el usuario."
        items={draft}
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
