import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CirujanosEditor from '../../components/admin/CirujanosEditor'
import {
  AdminSectionActions,
  filterEmptyStrings,
  useAdminSection,
} from './AdminLayout'

export default function AdminCirujanosPage() {
  const navigate = useNavigate()
  const selectDraft = useCallback(data => ({
    colelap: [...(data.cirujanos?.colelap || [])],
    histerectomia: [...(data.cirujanos?.histerectomia || [])],
    reemplazo: [...(data.cirujanos?.reemplazo || [])],
  }), [])

  const { draft, setDraft, saving, saveError, saveSuccess, handleSave, handleCancel } =
    useAdminSection('cirujanos', selectDraft)

  function onSave() {
    const normalized = {
      colelap: filterEmptyStrings(draft.colelap),
      histerectomia: filterEmptyStrings(draft.histerectomia),
      reemplazo: filterEmptyStrings(draft.reemplazo),
    }
    handleSave(normalized)
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Cirujanos</h2>
          <p>Gestiona las listas de cirujanos por tipo de procedimiento.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <CirujanosEditor data={draft} onChange={setDraft} />
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
