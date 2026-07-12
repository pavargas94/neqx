import { useNavigate } from 'react-router-dom'
import AyudantesPersonalEditor from '../../components/admin/AyudantesPersonalEditor'
import { emptyAyudante } from '../../utils/personalModel'
import { AdminSectionActions } from './AdminLayout'
import { useAyudantesCollection } from './usePersonalCollection'

export default function AdminAyudantesPage() {
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
  } = useAyudantesCollection()

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

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando ayudantes…</p>
      ) : (
        <>
          <AyudantesPersonalEditor
            members={members}
            onChange={setMembers}
            onAdd={() => setMembers(prev => [...prev, emptyAyudante()])}
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
