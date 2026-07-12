import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { ROLES } from '../utils/roles'

const DEFAULT_BOOTSTRAP_ADMINS = ['andresvhdez1994@gmail.com']

function buildBaseUser(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
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
  const role = snapshot.data().role || ROLES.ENFERMERIA

  if (role !== ROLES.ENFERMERIA || !bootstrapEmails.includes(firebaseUser.email)) {
    return { ...base, role }
  }

  try {
    await setDoc(userRef, { ...snapshot.data(), role: ROLES.ADMIN }, { merge: true })
    return { ...base, role: ROLES.ADMIN }
  } catch {
    return { ...base, role }
  }
}

export async function resolveUserProfile(firebaseUser) {
  const base = buildBaseUser(firebaseUser)

  if (!isFirebaseConfigured()) {
    return { ...base, role: ROLES.ENFERMERIA }
  }

  const db = getFirestoreDb()
  const userRef = doc(db, 'users', firebaseUser.uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) {
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
    createdAt: new Date().toISOString(),
  })

  return { ...base, role }
}
