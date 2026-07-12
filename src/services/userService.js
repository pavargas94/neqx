import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { COLLECTIONS } from '../data/firestoreCollections'
import { ROLES } from '../utils/roles'

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
}
