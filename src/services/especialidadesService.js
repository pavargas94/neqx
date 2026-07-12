/**
 * Servicio para la colección "especialidades".
 * Cada documento tiene un ID semántico (ej. "general", "ortopedia")
 * y contiene los procedimientos embebidos como array.
 * Fallback a especialidades.js local cuando Firestore no está disponible.
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { COLLECTIONS } from '../data/firestoreCollections'
import { ESPECIALIDADES } from '../data/especialidades'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'

const LABEL_CIRUJANO_DEFAULT = {
  colelap: 'Cirujano Principal:',
  histerectomia: 'Cirujano Ginecólogo:',
  reemplazo: 'Cirujano de Reemplazos:',
  artroscopia: 'Artroscopista:',
  segundoCirujano: 'Segundo Cirujano:',
}

const MUESTRA_DEFAULT = {
  colelap: 'vesícula biliar',
  histerectomia: 'útero y anexos',
  reemplazo: 'fragmentos óseos y tejido blando de rodilla',
}

function mapLocalToFirestoreShape(especialidades) {
  return especialidades.map((esp, idx) => ({
    id: esp.key,
    nombre: esp.label,
    descripcion: esp.description || '',
    rolNombre: esp.label,
    orden: idx + 1,
    procedimientos: (esp.cirugias || []).map(c => ({
      key: c.key,
      nombre: c.label,
      labelCirujano: LABEL_CIRUJANO_DEFAULT[c.key] || '',
      muestraDefault: MUESTRA_DEFAULT[c.key] || '',
      activo: true,
    })),
  }))
}

export const especialidadesService = {
  isConfigured: isFirebaseConfigured,

  async fetchAll() {
    if (!isFirebaseConfigured()) {
      return mapLocalToFirestoreShape(ESPECIALIDADES)
    }
    const db = getFirestoreDb()
    const snap = await getDocs(collection(db, COLLECTIONS.ESPECIALIDADES))
    if (snap.empty) {
      return mapLocalToFirestoreShape(ESPECIALIDADES)
    }
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
  },

  async save(id, data) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    const { id: _id, ...rest } = data
    await setDoc(doc(db, COLLECTIONS.ESPECIALIDADES, id), {
      nombre: rest.nombre || '',
      descripcion: rest.descripcion || '',
      rolNombre: rest.rolNombre || '',
      orden: rest.orden ?? 0,
      procedimientos: (rest.procedimientos || []).map(p => ({
        key: p.key || '',
        nombre: p.nombre || '',
        labelCirujano: p.labelCirujano || '',
        muestraDefault: p.muestraDefault || '',
        activo: p.activo !== false,
      })),
      actualizadoEn: serverTimestamp(),
    })
  },

  async delete(id) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    await deleteDoc(doc(db, COLLECTIONS.ESPECIALIDADES, id))
  },
}
