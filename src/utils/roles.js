export const ROLES = {
  ADMIN: 'admin',
  ENFERMERIA: 'enfermeria',
}

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Administrador' },
  { value: ROLES.ENFERMERIA, label: 'Enfermería' },
]

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN
}

export function getRoleLabel(role) {
  return ROLE_OPTIONS.find(option => option.value === role)?.label || role
}
