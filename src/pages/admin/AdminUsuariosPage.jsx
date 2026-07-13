import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AdminSectionActions } from './AdminLayout'
import { useUsersAdmin } from './useUsersAdmin'
import { ROLE_OPTIONS, ROLES, getRoleLabel } from '../../utils/roles'

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

function emptyCreateForm() {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: ROLES.ENFERMERIA,
    enabled: true,
  }
}

function emptyLinkForm() {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: ROLES.ENFERMERIA,
    enabled: true,
  }
}

function LinkUserForm({ linking, linkError, linkSuccess, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyLinkForm)

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await onSubmit(form)
      setForm(emptyLinkForm())
    } catch {
      // El error se muestra desde el hook.
    }
  }

  return (
    <form className="admin-users-create admin-users-link" onSubmit={handleSubmit}>
      <div className="admin-users-create-header">
        <h3>Vincular cuenta existente</h3>
        <p className="admin-editor-desc">
          Usa esta opción cuando el correo ya existe en Firebase Authentication
          pero no aparece en la lista. Necesitas la contraseña de esa cuenta
          para completar su perfil en la aplicación.
        </p>
      </div>

      {linkError && <p className="admin-error">{linkError}</p>}
      {linkSuccess && <p className="admin-success">Usuario vinculado correctamente.</p>}

      <div className="admin-users-create-grid">
        <div className="campo">
          <label htmlFor="link-user-email">Correo electrónico</label>
          <input
            id="link-user-email"
            type="email"
            value={form.email}
            placeholder="usuario@hospital.com"
            onChange={e => updateField('email', e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="link-user-display-name">Nombre para mostrar</label>
          <input
            id="link-user-display-name"
            type="text"
            value={form.displayName}
            placeholder="Opcional"
            onChange={e => updateField('displayName', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="link-user-password">Contraseña de la cuenta</label>
          <input
            id="link-user-password"
            type="password"
            value={form.password}
            placeholder="La misma que se usó al crearla"
            onChange={e => updateField('password', e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="campo">
          <label htmlFor="link-user-confirm-password">Confirmar contraseña</label>
          <input
            id="link-user-confirm-password"
            type="password"
            value={form.confirmPassword}
            placeholder="Repite la contraseña"
            onChange={e => updateField('confirmPassword', e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="campo">
          <label htmlFor="link-user-role">Rol</label>
          <select
            id="link-user-role"
            className="admin-users-select"
            value={form.role}
            onChange={e => updateField('role', e.target.value)}
          >
            {ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="campo admin-users-create-enabled">
          <label className="admin-users-toggle">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={e => updateField('enabled', e.target.checked)}
            />
            <span>Cuenta activa</span>
          </label>
        </div>
      </div>

      <div className="admin-actions-buttons">
        <button type="button" className="btn-admin-secondary" onClick={onCancel} disabled={linking}>
          Cancelar
        </button>
        <button type="submit" className="btn-admin-save" disabled={linking}>
          {linking ? 'Vinculando…' : 'Vincular usuario'}
        </button>
      </div>
    </form>
  )
}

function CreateUserForm({ creating, createError, createSuccess, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyCreateForm)

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await onSubmit(form)
      setForm(emptyCreateForm())
    } catch {
      // El error se muestra desde el hook.
    }
  }

  return (
    <form className="admin-users-create" onSubmit={handleSubmit}>
      <div className="admin-users-create-header">
        <h3>Nuevo usuario</h3>
        <p className="admin-editor-desc">
          Crea la cuenta de acceso y su perfil. Comparte la contraseña temporal con el usuario
          para su primer inicio de sesión.
        </p>
      </div>

      {createError && <p className="admin-error">{createError}</p>}
      {createSuccess && <p className="admin-success">Usuario creado correctamente.</p>}

      <div className="admin-users-create-grid">
        <div className="campo">
          <label htmlFor="create-user-email">Correo electrónico</label>
          <input
            id="create-user-email"
            type="email"
            value={form.email}
            placeholder="usuario@hospital.com"
            onChange={e => updateField('email', e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="create-user-display-name">Nombre para mostrar</label>
          <input
            id="create-user-display-name"
            type="text"
            value={form.displayName}
            placeholder="Opcional"
            onChange={e => updateField('displayName', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="create-user-password">Contraseña temporal</label>
          <input
            id="create-user-password"
            type="password"
            value={form.password}
            placeholder="Mínimo 6 caracteres"
            onChange={e => updateField('password', e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="campo">
          <label htmlFor="create-user-confirm-password">Confirmar contraseña</label>
          <input
            id="create-user-confirm-password"
            type="password"
            value={form.confirmPassword}
            placeholder="Repite la contraseña"
            onChange={e => updateField('confirmPassword', e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="campo">
          <label htmlFor="create-user-role">Rol</label>
          <select
            id="create-user-role"
            className="admin-users-select"
            value={form.role}
            onChange={e => updateField('role', e.target.value)}
          >
            {ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="campo admin-users-create-enabled">
          <label className="admin-users-toggle">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={e => updateField('enabled', e.target.checked)}
            />
            <span>Cuenta activa al crear</span>
          </label>
        </div>
      </div>

      <div className="admin-actions-buttons">
        <button type="button" className="btn-admin-secondary" onClick={onCancel} disabled={creating}>
          Cancelar
        </button>
        <button type="submit" className="btn-admin-save" disabled={creating}>
          {creating ? 'Creando…' : 'Crear usuario'}
        </button>
      </div>
    </form>
  )
}

function UserRow({ user, isCurrentUser, deleting, onChange, onDelete }) {
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
      <td className="admin-users-actions">
        <button
          type="button"
          className="btn-admin-remove"
          disabled={isSelf || deleting}
          onClick={() => onDelete(user)}
        >
          {deleting ? 'Eliminando…' : 'Eliminar'}
        </button>
      </td>
    </tr>
  )
}

export default function AdminUsuariosPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.auth.user)
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)

  const {
    users,
    loading,
    saving,
    creating,
    saveError,
    saveSuccess,
    createError,
    createSuccess,
    linking,
    linkError,
    linkSuccess,
    hasChanges,
    updateUser,
    handleSave,
    handleCancel,
    handleCreateUser,
    handleLinkUser,
    clearCreateStatus,
    clearLinkStatus,
    handleDeleteUser,
    deletingUid,
    deleteError,
    clearDeleteError,
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

  function openCreateForm() {
    clearCreateStatus()
    clearLinkStatus()
    setShowLinkForm(false)
    setShowCreateForm(true)
  }

  function closeCreateForm() {
    clearCreateStatus()
    setShowCreateForm(false)
  }

  function openLinkForm() {
    clearLinkStatus()
    clearCreateStatus()
    setShowCreateForm(false)
    setShowLinkForm(true)
  }

  function closeLinkForm() {
    clearLinkStatus()
    setShowLinkForm(false)
  }

  async function handleDelete(user) {
    const label = user.displayName || user.email
    const confirmed = window.confirm(
      `¿Eliminar la cuenta de "${label}"?\n\nSe borrará el acceso en Firebase y su perfil. Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return

    clearDeleteError()
    await handleDeleteUser(user.uid)
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Gestión de usuarios</h2>
          <p>
            Crea cuentas nuevas, asigna roles, habilita o deshabilita el acceso
            y elimina usuarios que ya no necesiten acceso.
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
        {!showCreateForm && !showLinkForm && (
          <div className="admin-users-toolbar-actions">
            <button type="button" className="btn-admin-secondary" onClick={openLinkForm}>
              Vincular cuenta existente
            </button>
            <button type="button" className="btn-admin-add" onClick={openCreateForm}>
              + Nuevo usuario
            </button>
          </div>
        )}
      </div>

      {showLinkForm && (
        <LinkUserForm
          linking={linking}
          linkError={linkError}
          linkSuccess={linkSuccess}
          onSubmit={handleLinkUser}
          onCancel={closeLinkForm}
        />
      )}

      {showCreateForm && (
        <CreateUserForm
          creating={creating}
          createError={createError}
          createSuccess={createSuccess}
          onSubmit={handleCreateUser}
          onCancel={closeCreateForm}
        />
      )}

      {deleteError && <p className="admin-error">{deleteError}</p>}

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <p>No hay usuarios registrados todavía.</p>
          <p className="admin-editor-desc">
            Si el correo ya existe en Firebase Authentication, usa
            «Vincular cuenta existente». Si no, crea uno con «Nuevo usuario».
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-users-no-results">
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <UserRow
                      key={user.uid}
                      user={user}
                      isCurrentUser={user.uid === currentUser?.uid}
                      deleting={deletingUid === user.uid}
                      onChange={updateUser}
                      onDelete={handleDelete}
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
