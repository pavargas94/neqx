import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AdminSectionActions } from './AdminLayout'
import { useUsersAdmin } from './useUsersAdmin'
import { ROLE_OPTIONS, getRoleLabel } from '../../utils/roles'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function UserRow({ user, isCurrentUser, onChange }) {
  const isSelf = isCurrentUser

  return (
    <tr className={`admin-users-row${!user.enabled ? ' admin-users-row-disabled' : ''}${isSelf ? ' admin-users-row-self' : ''}`}>
      <td>
        <div className="admin-users-name">
          <strong>{user.displayName}</strong>
          {isSelf && <span className="admin-users-badge-self">Tú</span>}
        </div>
        <span className="admin-users-email">{user.email}</span>
      </td>
      <td>
        <select
          className="admin-users-select"
          value={user.role}
          disabled={isSelf}
          onChange={e => onChange(user.uid, { role: e.target.value })}
        >
          {ROLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <label className="admin-users-toggle">
          <input
            type="checkbox"
            checked={user.enabled}
            disabled={isSelf}
            onChange={e => onChange(user.uid, { enabled: e.target.checked })}
          />
          <span>{user.enabled ? 'Activo' : 'Deshabilitado'}</span>
        </label>
      </td>
      <td>
        <span className={`admin-users-status${user.enabled ? ' is-active' : ' is-disabled'}`}>
          {user.enabled ? getRoleLabel(user.role) : 'Sin acceso'}
        </span>
      </td>
      <td className="admin-users-date">{formatDate(user.createdAt)}</td>
    </tr>
  )
}

export default function AdminUsuariosPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.auth.user)
  const [search, setSearch] = useState('')

  const {
    users,
    loading,
    saving,
    saveError,
    saveSuccess,
    hasChanges,
    updateUser,
    handleSave,
    handleCancel,
  } = useUsersAdmin(currentUser?.uid)

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users

    return users.filter(user => (
      user.email.toLowerCase().includes(query)
      || user.displayName.toLowerCase().includes(query)
      || getRoleLabel(user.role).toLowerCase().includes(query)
    ))
  }, [users, search])

  const activeCount = users.filter(user => user.enabled).length
  const adminCount = users.filter(user => user.enabled && user.role === 'admin').length

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Gestión de usuarios</h2>
          <p>
            Habilita o deshabilita cuentas y asigna roles de administrador o enfermería.
            Los usuarios aparecen aquí después de iniciar sesión por primera vez.
          </p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      <div className="admin-users-summary">
        <span>{users.length} usuarios registrados</span>
        <span>{activeCount} activos</span>
        <span>{adminCount} administradores</span>
      </div>

      <div className="admin-users-toolbar">
        <input
          type="search"
          className="admin-users-search"
          placeholder="Buscar por nombre, correo o rol…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <p>No hay usuarios registrados en Firestore.</p>
          <p className="admin-editor-desc">
            Crea las cuentas en Firebase Authentication; al primer inicio de sesión
            aparecerán en esta lista.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acceso</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-users-no-results">
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <UserRow
                      key={user.uid}
                      user={user}
                      isCurrentUser={user.uid === currentUser?.uid}
                      onChange={updateUser}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminSectionActions
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          {hasChanges && !saving && (
            <p className="admin-editor-desc" style={{ marginTop: '8px' }}>
              Hay cambios sin guardar.
            </p>
          )}
        </>
      )}
    </div>
  )
}
