import { useNavigate } from 'react-router-dom'
import SimplePersonalEditor from '../../components/admin/SimplePersonalEditor'
import { TIPOS_PERSONAL } from '../../data/firestoreCollections'
import { emptySimpleMember } from '../../utils/personalModel'
import { AdminSectionActions } from './AdminLayout'
import { useInstrumentadoresCollection } from './usePersonalCollection'

export default function AdminInstrumentadoresPage() {
  const navigate = useNavigate()
  const {
    members,
    setMembers,
    loading,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    handleCancel,
  } = useInstrumentadoresCollection()

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

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando instrumentadores…</p>
      ) : (
        <>
          <SimplePersonalEditor
            title="Instrumentadores"
            placeholder="Nombre del instrumentador"
            members={members}
            onChange={setMembers}
            onAdd={() => setMembers(prev => [...prev, emptySimpleMember(TIPOS_PERSONAL.INSTRUMENTADOR)])}
          />
          <AdminSectionActions
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  )
}
