const CREATE_USER_ERRORS = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/operation-not-allowed': 'El registro por correo no está habilitado en Firebase.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu red.',
}

export function mapFirebaseAuthError(error, fallback = 'No se pudo completar la operación.') {
  return CREATE_USER_ERRORS[error?.code] || fallback
}

export function mapCallableError(error, fallback = 'No se pudo completar la operación.') {
  const callableMessages = {
    'functions/unauthenticated': 'Debes iniciar sesión.',
    'functions/permission-denied': 'No tienes permiso para realizar esta acción.',
    'functions/not-found': 'El usuario no existe.',
    'functions/invalid-argument': 'Los datos enviados no son válidos.',
    'functions/unavailable': 'El servicio no está disponible. Verifica que las Cloud Functions estén desplegadas.',
    'functions/internal': 'Error interno del servidor.',
  }

  if (error?.code === 'functions/failed-precondition' && error?.message) {
    return error.message
  }

  return callableMessages[error?.code] || error?.message || fallback
}

export function validateNewUserInput({ email, password, confirmPassword, displayName, role }) {
  const trimmedEmail = email?.trim() || ''
  const trimmedName = displayName?.trim() || ''

  if (!trimmedEmail) return 'Ingresa el correo electrónico del usuario.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return 'El correo electrónico no es válido.'
  }
  if (!password) return 'Ingresa una contraseña temporal.'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
  if (password !== confirmPassword) return 'Las contraseñas no coinciden.'
  if (!role) return 'Selecciona un rol para el usuario.'
  if (trimmedName.length > 80) return 'El nombre no puede superar 80 caracteres.'

  return null
}
