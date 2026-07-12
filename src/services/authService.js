import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { resolveUserProfile, USER_DISABLED_ERROR } from './userService'
import { ROLES } from '../utils/roles'

function mapFirebaseUserOffline(firebaseUser) {
  if (!firebaseUser) return null

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
    role: ROLES.ENFERMERIA,
  }
}

function mapFirebaseError(error) {
  const messages = {
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/user-not-found': 'No existe una cuenta con este correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu red.',
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  }

  return messages[error?.code] || 'No se pudo completar la operación. Intenta de nuevo.'
}

function validateCredentials(email, password) {
  if (!email?.trim()) return 'Ingresa tu correo electrónico.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo electrónico no es válido.'
  if (!password) return 'Ingresa tu contraseña.'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
  return null
}

export const authService = {
  isConfigured: isFirebaseConfigured,

  subscribeToAuthChanges(callback) {
    if (!isFirebaseConfigured()) {
      callback(null)
      return () => {}
    }

    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null)
        return
      }

      try {
        const user = await resolveUserProfile(firebaseUser)
        callback(user)
      } catch (error) {
        if (error?.code === USER_DISABLED_ERROR || error?.message === USER_DISABLED_ERROR) {
          await firebaseSignOut(auth)
          callback(null)
          return
        }
        callback(mapFirebaseUserOffline(firebaseUser))
      }
    })
  },

  async signIn(email, password) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado. Contacta al administrador del sistema.')
    }

    const validationError = validateCredentials(email, password)
    if (validationError) throw new Error(validationError)

    try {
      const auth = getFirebaseAuth()
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      return await resolveUserProfile(credential.user)
    } catch (error) {
      if (error?.code === USER_DISABLED_ERROR || error?.message === USER_DISABLED_ERROR) {
        const auth = getFirebaseAuth()
        await firebaseSignOut(auth)
        throw new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.')
      }
      throw new Error(mapFirebaseError(error))
    }
  },

  async signOut() {
    if (!isFirebaseConfigured()) return

    try {
      const auth = getFirebaseAuth()
      await firebaseSignOut(auth)
    } catch (error) {
      throw new Error(mapFirebaseError(error))
    }
  },
}
