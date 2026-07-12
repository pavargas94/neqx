import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import KeyValueEditor from '../../components/admin/KeyValueEditor'
import { AdminSectionActions, useAdminSection } from './AdminLayout'

export default function AdminEtiquetasPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => ({ ...data.labelCirujano }), [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('labelCirujano', selectDraft)

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Etiquetas de cirujano</h2>
          <p>Texto del label del select principal de cirujano.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <KeyValueEditor
        title="Etiquetas por procedimiento"
        data={draft}
        onChange={setDraft}
        placeholders={{
          colelap: 'Cirujano Principal:',
          histerectomia: 'Cirujano Ginecólogo:',
          reemplazo: 'Cirujano de Reemplazos:',
        }}
      />
      <AdminSectionActions
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
