import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CirujanosPersonalEditor from '../../components/admin/CirujanosPersonalEditor'
import { emptyCirujano } from '../../utils/personalModel'
import { AdminSectionActions } from './AdminLayout'
import { useCirujanosCollection } from './usePersonalCollection'

export default function AdminCirujanosPage() {
  const navigate = useNavigate()
  const [focusIndex, setFocusIndex] = useState(null)
  const {
    members,
    setMembers,
    especialidades,
    loading,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    handleCancel,
  } = useCirujanosCollection()

  function handleAdd(especialidadId) {
    const newIndex = members.length
    setMembers(prev => [
      ...prev,
      {
        ...emptyCirujano(especialidadId, especialidades),
        _clientId: `new-${Date.now()}`,
      },
    ])
    setFocusIndex(newIndex)
  }

  function handleCancelDraft() {
    setFocusIndex(null)
    handleCancel()
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Cirujanos</h2>
          <p>
            Gestiona cirujanos con nombre, especialidad (rol principal) y categorías
            opcionales para filtrar procedimientos.
          </p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando cirujanos…</p>
      ) : (
        <>
          <CirujanosPersonalEditor
            members={members}
            especialidades={especialidades}
            onChange={setMembers}
            onAdd={handleAdd}
            focusIndex={focusIndex}
          />
          <AdminSectionActions
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={handleSave}
            onCancel={handleCancelDraft}
          />
        </>
      )}
    </div>
  )
}
