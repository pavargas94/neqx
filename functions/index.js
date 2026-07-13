const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()

async function assertAdmin(uid) {
  const snapshot = await getFirestore().doc(`users/${uid}`).get()

  if (!snapshot.exists || snapshot.data().role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Solo los administradores pueden eliminar usuarios.',
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
