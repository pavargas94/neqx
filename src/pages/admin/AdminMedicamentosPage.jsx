import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import LabeledListEditor from '../../components/admin/LabeledListEditor'
import {
  AdminSectionActions,
  filterLabeledItems,
  useAdminSection,
} from './AdminLayout'

export default function AdminMedicamentosPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(
    data => (data.medicamentosLista || []).map(item => ({ ...item })),
    [],
  )

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('medicamentosLista', selectDraft)

  function onSave() {
    handleSave(filterLabeledItems(draft))
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Medicamentos</h2>
          <p>Opciones de analgesia y medicación en sala.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <LabeledListEditor
        title="Medicamentos en sala"
        description="Valor: texto en la nota. Etiqueta: nombre visible en el checkbox."
        items={draft}
        onChange={setDraft}
        showSpan2
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
