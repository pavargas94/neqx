import { useCallback, useEffect, useState } from 'react'
import { userAdminService } from '../../services/userService'

function cloneUsers(users) {
  return users.map(user => ({ ...user }))
}

function usersEqual(a, b) {
  if (a.length !== b.length) return false

  const initialById = new Map(b.map(user => [user.uid, user]))
  return a.every(user => {
    const initial = initialById.get(user.uid)
    if (!initial) return false
    return (
      user.role === initial.role
      && user.enabled === initial.enabled
      && user.displayName === initial.displayName
    )
  })
}

export function useUsersAdmin(currentUserId) {
  const [users, setUsers] = useState([])
  const [initialUsers, setInitialUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setSaveError(null)
    try {
      const data = await userAdminService.fetchAll()
      const cloned = cloneUsers(data)
      setUsers(cloned)
      setInitialUsers(cloneUsers(data))
    } catch (error) {
      setSaveError(error.message || 'No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  function updateUser(uid, changes) {
    setUsers(prev => prev.map(user => (
      user.uid === uid ? { ...user, ...changes } : user
    )))
    setSaveError(null)
    setSaveSuccess(false)
  }

  function validateChanges() {
    const activeAdmins = users.filter(user => user.enabled && user.role === 'admin')
    if (activeAdmins.length === 0) {
      return 'Debe haber al menos un administrador activo.'
    }

    const current = users.find(user => user.uid === currentUserId)
    if (current) {
      if (!current.enabled) {
        return 'No puedes deshabilitar tu propia cuenta.'
      }
      if (current.role !== 'admin') {
        return 'No puedes quitarte el rol de administrador a ti mismo.'
      }
    }

    return null
  }

  async function handleSave() {
    const validationError = validateChanges()
    if (validationError) {
      setSaveError(validationError)
      return
    }

    const changedUsers = users.filter(user => {
      const initial = initialUsers.find(item => item.uid === user.uid)
      if (!initial) return true
      return (
        user.role !== initial.role
        || user.enabled !== initial.enabled
        || user.displayName !== initial.displayName
      )
    })

    if (changedUsers.length === 0) {
      setSaveError('No hay cambios por guardar.')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await Promise.all(changedUsers.map(user => {
        const initial = initialUsers.find(item => item.uid === user.uid)
        const payload = {}

        if (!initial || user.role !== initial.role) payload.role = user.role
        if (!initial || user.enabled !== initial.enabled) payload.enabled = user.enabled
        if (!initial || user.displayName !== initial.displayName) {
          payload.displayName = user.displayName
        }

        return userAdminService.updateUser(user.uid, payload)
      }))

      const refreshed = cloneUsers(users)
      setInitialUsers(refreshed)
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setUsers(cloneUsers(initialUsers))
    setSaveError(null)
    setSaveSuccess(false)
  }

  const hasChanges = !usersEqual(users, initialUsers)

  return {
    users,
    loading,
    saving,
    saveError,
    saveSuccess,
    hasChanges,
    updateUser,
    handleSave,
    handleCancel,
    reload: load,
  }
}
