import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import KeyValueEditor from '../../components/admin/KeyValueEditor'
import { AdminSectionActions, useAdminSection } from './AdminLayout'

export default function AdminMuestrasPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => ({ ...data.muestrasDefault }), [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('muestrasDefault', selectDraft)

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Muestras de patología</h2>
          <p>Texto predeterminado al cambiar el tipo de cirugía.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <KeyValueEditor
        title="Descripción de muestra por procedimiento"
        data={draft}
        onChange={setDraft}
        placeholders={{
          colelap: 'vesícula biliar',
          histerectomia: 'útero y anexos',
          reemplazo: 'fragmentos óseos y tejido blando de rodilla',
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
