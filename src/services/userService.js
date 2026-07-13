import { createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp, getFirestoreDb, getSecondaryFirebaseAuth, isFirebaseConfigured } from './firebase'
import { COLLECTIONS } from '../data/firestoreCollections'
import { ROLES } from '../utils/roles'
import { mapFirebaseAuthError, mapCallableError, validateNewUserInput } from '../utils/firebaseAuthErrors'

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

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = displayName?.trim() || trimmedEmail.split('@')[0]
    const secondaryAuth = getSecondaryFirebaseAuth()

    let credential
    try {
      credential = await createUserWithEmailAndPassword(secondaryAuth, trimmedEmail, password)
    } catch (error) {
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
      throw new Error(
        error.message
        || 'La cuenta de acceso se creó, pero no se pudo guardar el perfil en Firestore.',
      )
    }

    return mapUserDoc(uid, profile)
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
