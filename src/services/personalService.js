/**
 * Servicio para el nuevo modelo de Personal (documentos individuales).
 * Cada miembro del personal quirúrgico es un documento propio en la colección "personal".
 * Coexiste con el modelo legado (personal/settings) hasta completar la migración.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { COLLECTIONS, TIPOS_PERSONAL } from '../data/firestoreCollections'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'

function toPersonalDoc(data) {
  const doc = {
    nombre: (data.nombre || '').trim(),
    tipo: data.tipo || TIPOS_PERSONAL.CIRUJANO,
    rol: data.rol || null,
    especialidadId: data.especialidadId || null,
    categorias: Array.isArray(data.categorias) ? data.categorias.filter(Boolean) : [],
    activo: data.activo !== false,
  }
  if (data.label) doc.label = data.label
  return doc
}

export const personalService = {
  isConfigured: isFirebaseConfigured,

  async fetchAll() {
    if (!isFirebaseConfigured()) return []
    const db = getFirestoreDb()
    const q = query(
      collection(db, COLLECTIONS.PERSONAL),
      where('activo', '==', true),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async fetchByTipo(tipo) {
    if (!isFirebaseConfigured()) return []
    const db = getFirestoreDb()
    const q = query(
      collection(db, COLLECTIONS.PERSONAL),
      where('tipo', '==', tipo),
      where('activo', '==', true),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async fetchCirujanosByEspecialidad(especialidadId) {
    if (!isFirebaseConfigured()) return []
    const db = getFirestoreDb()
    const q = query(
      collection(db, COLLECTIONS.PERSONAL),
      where('tipo', '==', TIPOS_PERSONAL.CIRUJANO),
      where('especialidadId', '==', especialidadId),
      where('activo', '==', true),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async upsert(id, data) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    const ref = doc(db, COLLECTIONS.PERSONAL, id)
    const snap = await getDoc(ref)
    await setDoc(ref, {
      ...toPersonalDoc(data),
      ...(snap.exists() ? {} : { creadoEn: serverTimestamp() }),
      actualizadoEn: serverTimestamp(),
    }, { merge: true })
    return id
  },

  async create(data) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    const ref = await addDoc(collection(db, COLLECTIONS.PERSONAL), {
      ...toPersonalDoc(data),
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    })
    return ref.id
  },

  async update(id, data) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    await setDoc(
      doc(db, COLLECTIONS.PERSONAL, id),
      { ...toPersonalDoc(data), actualizadoEn: serverTimestamp() },
      { merge: true },
    )
  },

  async deactivate(id) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    await setDoc(
      doc(db, COLLECTIONS.PERSONAL, id),
      { activo: false, actualizadoEn: serverTimestamp() },
      { merge: true },
    )
  },

  async delete(id) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    await deleteDoc(doc(db, COLLECTIONS.PERSONAL, id))
  },
}
