const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()

const VALID_ROLES = new Set(['admin', 'enfermeria'])

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function validateCreatePayload(data) {
  const email = normalizeEmail(data?.email)
  const password = data?.password || ''
  const displayName = (data?.displayName || '').trim()
  const role = data?.role || 'enfermeria'

  if (!email) {
    throw new HttpsError('invalid-argument', 'Ingresa el correo electrónico del usuario.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'El correo electrónico no es válido.')
  }

  if (!password || password.length < 6) {
    throw new HttpsError('invalid-argument', 'La contraseña debe tener al menos 6 caracteres.')
  }

  if (!VALID_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', 'El rol seleccionado no es válido.')
  }

  if (displayName.length > 80) {
    throw new HttpsError('invalid-argument', 'El nombre no puede superar 80 caracteres.')
  }

  return {
    email,
    password,
    displayName: displayName || email.split('@')[0],
    role,
    enabled: data?.enabled !== false,
  }
}

function validateLinkPayload(data) {
  const email = normalizeEmail(data?.email)
  const displayName = (data?.displayName || '').trim()
  const role = data?.role || 'enfermeria'

  if (!email) {
    throw new HttpsError('invalid-argument', 'Ingresa el correo electrónico del usuario.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'El correo electrónico no es válido.')
  }

  if (!VALID_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', 'El rol seleccionado no es válido.')
  }

  if (displayName.length > 80) {
    throw new HttpsError('invalid-argument', 'El nombre no puede superar 80 caracteres.')
  }

  return {
    email,
    displayName: displayName || email.split('@')[0],
    role,
    enabled: data?.enabled !== false,
  }
}

async function linkAuthUserProfile(payload) {
  let userRecord

  try {
    userRecord = await getAuth().getUserByEmail(payload.email)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'No existe una cuenta de acceso con ese correo.')
    }
    throw new HttpsError('internal', 'No se pudo buscar la cuenta de acceso.')
  }

  const profileRef = getFirestore().doc(`users/${userRecord.uid}`)
  const existing = await profileRef.get()

  const profile = {
    email: payload.email,
    displayName: payload.displayName || userRecord.displayName || payload.email.split('@')[0],
    role: payload.role,
    enabled: payload.enabled,
    createdAt: existing.exists && existing.data()?.createdAt
      ? existing.data().createdAt
      : new Date().toISOString(),
  }

  await profileRef.set(profile, { merge: true })

  return {
    uid: userRecord.uid,
    ...profile,
    linked: true,
  }
}

async function assertAdmin(uid) {
  const snapshot = await getFirestore().doc(`users/${uid}`).get()

  if (!snapshot.exists || snapshot.data().role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Solo los administradores pueden gestionar usuarios.',
    )
  }
}

async function assertCanDeleteTarget(targetUid) {
  const db = getFirestore()
  const targetRef = db.doc(`users/${targetUid}`)
  const targetSnap = await targetRef.get()

  if (!targetSnap.exists) {
    throw new HttpsError('not-found', 'El usuario no existe.')
  }

  const target = targetSnap.data()
  if (target.role === 'admin' && target.enabled !== false) {
    const adminsSnap = await db.collection('users').where('role', '==', 'admin').get()
    const activeAdmins = adminsSnap.docs.filter(doc => doc.data().enabled !== false)

    if (activeAdmins.length <= 1) {
      throw new HttpsError(
        'failed-precondition',
        'No puedes eliminar el último administrador activo.',
      )
    }
  }

  return targetRef
}

exports.createAppUser = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  }

  await assertAdmin(request.auth.uid)

  const payload = validateCreatePayload(request.data)

  let userRecord
  try {
    userRecord = await getAuth().createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.displayName,
    })
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return linkAuthUserProfile({
        email: payload.email,
        displayName: payload.displayName,
        role: payload.role,
        enabled: payload.enabled,
      })
    }
    if (error.code === 'auth/invalid-email') {
      throw new HttpsError('invalid-argument', 'El correo electrónico no es válido.')
    }
    if (error.code === 'auth/weak-password') {
      throw new HttpsError('invalid-argument', 'La contraseña debe tener al menos 6 caracteres.')
    }
    throw new HttpsError('internal', 'No se pudo crear la cuenta de acceso.')
  }

  const profile = {
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
    enabled: payload.enabled,
    createdAt: new Date().toISOString(),
  }

  try {
    await getFirestore().doc(`users/${userRecord.uid}`).set(profile)
  } catch (error) {
    try {
      await getAuth().deleteUser(userRecord.uid)
    } catch {
      // Si el rollback falla, al menos reportamos el error principal.
    }
    throw new HttpsError('internal', 'No se pudo guardar el perfil del usuario.')
  }

  return {
    uid: userRecord.uid,
    ...profile,
  }
})

exports.linkAppUserProfile = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  }

  await assertAdmin(request.auth.uid)

  const payload = validateLinkPayload(request.data)
  return linkAuthUserProfile(payload)
})

exports.deleteAppUser = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  }

  await assertAdmin(request.auth.uid)

  const targetUid = request.data?.uid
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'Usuario inválido.')
  }

  if (targetUid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'No puedes eliminar tu propia cuenta.')
  }

  const targetRef = await assertCanDeleteTarget(targetUid)

  try {
    await getAuth().deleteUser(targetUid)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', 'No se pudo eliminar la cuenta de acceso.')
    }
  }

  await targetRef.delete()

  return { success: true }
})
