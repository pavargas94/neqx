export const ROLES = {
  ADMIN: 'admin',
  ENFERMERIA: 'enfermeria',
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN
}
