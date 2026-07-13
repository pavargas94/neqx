import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp, getFirestoreDb, getSecondaryFirebaseAuth, isFirebaseConfigured } from './firebase'
import { COLLECTIONS } from '../data/firestoreCollections'
import { ROLES } from '../utils/roles'
import { mapFirebaseAuthError, mapCallableError, validateLinkUserInput, validateNewUserInput } from '../utils/firebaseAuthErrors'

const DEFAULT_BOOTSTRAP_ADMINS = ['andresvhdez1994@gmail.com']
export const USER_DISABLED_ERROR = 'USER_DISABLED'

function buildBaseUser(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
  }
}

function mapUserDoc(uid, data) {
  return {
    uid,
    email: data.email || '',
    displayName: data.displayName || data.email?.split('@')[0] || 'Usuario',
    role: data.role || ROLES.ENFERMERIA,
    enabled: data.enabled !== false,
    createdAt: data.createdAt || null,
  }
}

async function getBootstrapAdminEmails(db) {
  const ref = doc(db, 'config', 'bootstrapAdmins')
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const emails = snap.data().emails
      return Array.isArray(emails) ? emails : DEFAULT_BOOTSTRAP_ADMINS
    }

    await setDoc(ref, { emails: DEFAULT_BOOTSTRAP_ADMINS })
    return DEFAULT_BOOTSTRAP_ADMINS
  } catch {
    return DEFAULT_BOOTSTRAP_ADMINS
  }
}

async function promoteBootstrapAdmin(db, userRef, snapshot, firebaseUser, base) {
  const bootstrapEmails = await getBootstrapAdminEmails(db)
  const data = snapshot.data()
  const role = data.role || ROLES.ENFERMERIA

  if (role !== ROLES.ENFERMERIA || !bootstrapEmails.includes(firebaseUser.email)) {
    return { ...base, role, enabled: data.enabled !== false }
  }

  try {
    await setDoc(userRef, { ...data, role: ROLES.ADMIN }, { merge: true })
    return { ...base, role: ROLES.ADMIN, enabled: data.enabled !== false }
  } catch {
    return { ...base, role, enabled: data.enabled !== false }
  }
}

export async function resolveUserProfile(firebaseUser) {
  const base = buildBaseUser(firebaseUser)

  if (!isFirebaseConfigured()) {
    return { ...base, role: ROLES.ENFERMERIA, enabled: true }
  }

  const db = getFirestoreDb()
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) {
    const data = snapshot.data()
    if (data.enabled === false) {
      const error = new Error(USER_DISABLED_ERROR)
      error.code = USER_DISABLED_ERROR
      throw error
    }

    return promoteBootstrapAdmin(db, userRef, snapshot, firebaseUser, base)
  }

  const bootstrapEmails = await getBootstrapAdminEmails(db)
  const role = bootstrapEmails.includes(firebaseUser.email)
    ? ROLES.ADMIN
    : ROLES.ENFERMERIA

  await setDoc(userRef, {
    email: firebaseUser.email,
    displayName: base.displayName,
    role,
    enabled: true,
    createdAt: new Date().toISOString(),
  })

  return { ...base, role, enabled: true }
}

const FIRESTORE_PERMISSION_ERROR = 'permission-denied'

function isFirestorePermissionError(error) {
  return error?.code === FIRESTORE_PERMISSION_ERROR
    || /missing or insufficient permissions/i.test(error?.message || '')
}

async function linkUserProfileViaClient({ email, password, displayName, role, enabled = true }) {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = displayName?.trim() || trimmedEmail.split('@')[0]
  const secondaryAuth = getSecondaryFirebaseAuth()

  let uid
  try {
    const credential = await signInWithEmailAndPassword(secondaryAuth, trimmedEmail, password)
    uid = credential.user.uid
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error, 'No se pudo verificar la cuenta. Revisa el correo y la contraseña.'))
  } finally {
    try {
      await firebaseSignOut(secondaryAuth)
    } catch {
      // La sesión secundaria no debe afectar al administrador.
    }
  }

  const db = getFirestoreDb()
  const userRef = doc(db, COLLECTIONS.USERS, uid)
  const existing = await getDoc(userRef)

  const profile = {
    email: trimmedEmail,
    displayName: trimmedName,
    role: role || ROLES.ENFERMERIA,
    enabled: enabled !== false,
    createdAt: existing.exists() && existing.data()?.createdAt
      ? existing.data().createdAt
      : new Date().toISOString(),
  }

  try {
    await setDoc(userRef, profile, { merge: true })
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      throw new Error(
        'Permisos insuficientes en Firestore. Despliega las reglas actualizadas con: firebase deploy --only firestore:rules',
      )
    }

    throw new Error(error.message || 'No se pudo guardar el perfil del usuario.')
  }

  return mapUserDoc(uid, profile)
}

async function linkUserProfileViaCallable({ email, displayName, role, enabled }) {
  const functions = getFunctions(getFirebaseApp())
  const linkAppUserProfile = httpsCallable(functions, 'linkAppUserProfile')

  const result = await linkAppUserProfile({
    email: email.trim(),
    displayName: displayName?.trim() || '',
    role,
    enabled,
  })

  return mapUserDoc(result.data.uid, result.data)
}

async function createUserViaCallable({ email, password, displayName, role, enabled }) {
  const functions = getFunctions(getFirebaseApp())
  const createAppUser = httpsCallable(functions, 'createAppUser')

  const result = await createAppUser({
    email: email.trim(),
    password,
    displayName: displayName?.trim() || '',
    role,
    enabled,
  })

  return mapUserDoc(result.data.uid, result.data)
}

async function createUserViaClient({ email, password, displayName, role, enabled = true }) {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = displayName?.trim() || trimmedEmail.split('@')[0]
  const secondaryAuth = getSecondaryFirebaseAuth()

  let credential
  try {
    credential = await createUserWithEmailAndPassword(secondaryAuth, trimmedEmail, password)
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use') {
      throw error
    }
    throw new Error(mapFirebaseAuthError(error, 'No se pudo crear la cuenta de acceso.'))
  } finally {
    try {
      await firebaseSignOut(secondaryAuth)
    } catch {
      // La sesión secundaria no debe afectar al administrador.
    }
  }

  const uid = credential.user.uid
  const profile = {
    email: trimmedEmail,
    displayName: trimmedName,
    role: role || ROLES.ENFERMERIA,
    enabled: enabled !== false,
    createdAt: new Date().toISOString(),
  }

  const db = getFirestoreDb()
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, uid), profile)
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      throw new Error(
        'Permisos insuficientes en Firestore. Despliega las reglas actualizadas con: firebase deploy --only firestore:rules',
      )
    }

    throw new Error(
      error.message
      || 'La cuenta de acceso se creó, pero no se pudo guardar el perfil en Firestore.',
    )
  }

  return mapUserDoc(uid, profile)
}

function shouldFallbackToClientCallable(error) {
  const fallbackCodes = new Set([
    'functions/not-found',
    'functions/unavailable',
    'functions/internal',
  ])

  return fallbackCodes.has(error?.code)
    || /^internal$/i.test(error?.message || '')
}

export const userAdminService = {
  isConfigured: isFirebaseConfigured,

  async fetchAll() {
    if (!isFirebaseConfigured()) {
      return []
    }

    const db = getFirestoreDb()
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
    return snapshot.docs
      .map(docSnap => mapUserDoc(docSnap.id, docSnap.data()))
      .sort((a, b) => {
        const emailCompare = a.email.localeCompare(b.email, 'es')
        if (emailCompare !== 0) return emailCompare
        return a.displayName.localeCompare(b.displayName, 'es')
      })
  },

  async updateUser(uid, { role, enabled, displayName }) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const payload = {}
    if (role !== undefined) payload.role = role
    if (enabled !== undefined) payload.enabled = enabled
    if (displayName !== undefined) payload.displayName = displayName.trim()

    if (Object.keys(payload).length === 0) {
      return
    }

    const db = getFirestoreDb()
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), payload)
  },

  async createUser({ email, password, confirmPassword, displayName, role, enabled = true }) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const validationError = validateNewUserInput({
      email,
      password,
      confirmPassword,
      displayName,
      role,
    })
    if (validationError) {
      throw new Error(validationError)
    }

    const payload = { email, password, displayName, role, enabled }

    try {
      return await createUserViaCallable(payload)
    } catch (error) {
      if (!shouldFallbackToClientCallable(error)) {
        throw new Error(mapCallableError(error, 'No se pudo crear el usuario.'))
      }
    }

    try {
      return await createUserViaClient(payload)
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        return linkUserProfileViaClient(payload)
      }
      throw error instanceof Error && error.message
        ? error
        : new Error('No se pudo crear el usuario.')
    }
  },

  async linkUserProfile({ email, password, confirmPassword, displayName, role, enabled = true }) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const validationError = validateLinkUserInput({
      email,
      password,
      confirmPassword,
      displayName,
      role,
    })
    if (validationError) {
      throw new Error(validationError)
    }

    const payload = { email, password, displayName, role, enabled }

    try {
      return await linkUserProfileViaCallable(payload)
    } catch (error) {
      if (!shouldFallbackToClientCallable(error)) {
        throw new Error(mapCallableError(error, 'No se pudo vincular el usuario.'))
      }
    }

    return linkUserProfileViaClient(payload)
  },

  validateDelete(uid, { currentUserId, users }) {
    if (!uid) return 'Usuario inválido.'
    if (uid === currentUserId) return 'No puedes eliminar tu propia cuenta.'

    const target = users.find(user => user.uid === uid)
    if (!target) return 'El usuario no existe.'

    if (target.enabled && target.role === ROLES.ADMIN) {
      const activeAdmins = users.filter(user => user.enabled && user.role === ROLES.ADMIN)
      if (activeAdmins.length <= 1) {
        return 'No puedes eliminar el último administrador activo.'
      }
    }

    return null
  },

  async deleteUser(uid, { currentUserId, users }) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const validationError = userAdminService.validateDelete(uid, { currentUserId, users })
    if (validationError) {
      throw new Error(validationError)
    }

    const functions = getFunctions(getFirebaseApp())
    const deleteAppUser = httpsCallable(functions, 'deleteAppUser')

    try {
      await deleteAppUser({ uid })
    } catch (error) {
      throw new Error(mapCallableError(error, 'No se pudo eliminar el usuario.'))
    }
  },
}
