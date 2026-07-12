import { useNavigate } from 'react-router-dom'
import SimplePersonalEditor from '../../components/admin/SimplePersonalEditor'
import { TIPOS_PERSONAL } from '../../data/firestoreCollections'
import { emptySimpleMember } from '../../utils/personalModel'
import { AdminSectionActions } from './AdminLayout'
import { useAnestesiologosCollection } from './usePersonalCollection'

export default function AdminAnestesiologosPage() {
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
  } = useAnestesiologosCollection()

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

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando anestesiólogos…</p>
      ) : (
        <>
          <SimplePersonalEditor
            title="Anestesiólogos"
            placeholder="Nombre del anestesiólogo"
            members={members}
            onChange={setMembers}
            onAdd={() => setMembers(prev => [...prev, emptySimpleMember(TIPOS_PERSONAL.ANESTESIOLOGO)])}
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
