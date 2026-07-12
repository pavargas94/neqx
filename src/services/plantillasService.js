/**
 * Servicio para la colección "plantillas".
 * Gestiona los templates de notas quirúrgicas con cache en memoria.
 *
 * Documentos en Firestore:
 *   plantillas/colelap        → secciones + sufijoAnestesia
 *   plantillas/histerectomia  → secciones + sufijoAnestesia
 *   plantillas/reemplazo      → secciones + sufijoAnestesia
 *   plantillas/_anestesia     → bloques de anestesia compartidos
 *   plantillas/_config        → textosDrenaje + camposValidacion
 *
 * Flujo:
 *   1. App llama preload() al iniciar sesión (fire-and-forget).
 *   2. getCache() devuelve Firestore si está disponible, o DEFAULT_PLANTILLAS.
 *   3. El generador de notas llama getCache() sincrónicamente.
 */
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { COLLECTIONS } from '../data/firestoreCollections'
import { DEFAULT_PLANTILLAS } from '../data/plantillasDefaults'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'

let _cache = null

export const plantillasService = {
  /**
   * Devuelve plantillas del cache (Firestore) o el fallback local.
   * Siempre sincrónico — seguro para usar en generarReporte().
   */
  getCache() {
    return _cache ?? DEFAULT_PLANTILLAS
  },

  /**
   * Precarga plantillas desde Firestore en segundo plano.
   * Llamar una vez al iniciar sesión. No bloquea la UI.
   */
  async preload() {
    if (!isFirebaseConfigured()) {
      _cache = DEFAULT_PLANTILLAS
      return
    }
    try {
      const db = getFirestoreDb()
      const snap = await getDocs(collection(db, COLLECTIONS.PLANTILLAS))
      if (snap.empty) {
        _cache = { ...DEFAULT_PLANTILLAS }
        return
      }
      const fromFirestore = {}
      snap.docs.forEach(d => {
        fromFirestore[d.id] = d.data()
      })
      _cache = { ...DEFAULT_PLANTILLAS, ...fromFirestore }
    } catch {
      _cache = { ...DEFAULT_PLANTILLAS }
    }
  },

  /**
   * Carga completa para el panel admin (siempre va a Firestore).
   */
  async fetchAll() {
    if (!isFirebaseConfigured()) return { ...DEFAULT_PLANTILLAS }
    try {
      const db = getFirestoreDb()
      const snap = await getDocs(collection(db, COLLECTIONS.PLANTILLAS))
      if (snap.empty) return { ...DEFAULT_PLANTILLAS }
      const fromFirestore = {}
      snap.docs.forEach(d => {
        fromFirestore[d.id] = d.data()
      })
      return { ...DEFAULT_PLANTILLAS, ...fromFirestore }
    } catch {
      return { ...DEFAULT_PLANTILLAS }
    }
  },

  /**
   * Guarda un documento de plantilla en Firestore y actualiza el cache.
   * @param {string} key - 'colelap' | 'histerectomia' | 'reemplazo' | '_anestesia' | '_config'
   * @param {object} data - Datos a guardar (sin timestamps)
   */
  async save(key, data) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    const db = getFirestoreDb()
    const { actualizadoEn: _ts, ...rest } = data
    await setDoc(doc(db, COLLECTIONS.PLANTILLAS, key), {
      ...rest,
      actualizadoEn: serverTimestamp(),
    })
    if (_cache) {
      _cache[key] = rest
    }
  },

  /**
   * Elimina una plantilla de procedimiento de Firestore y del cache.
   * No puede eliminar documentos de sistema (_anestesia, _config).
   * @param {string} key - Clave del procedimiento a eliminar
   */
  async delete(key) {
    if (!isFirebaseConfigured()) throw new Error('Firebase no está configurado.')
    if (key.startsWith('_')) throw new Error('No se pueden eliminar documentos de sistema.')
    const db = getFirestoreDb()
    await deleteDoc(doc(db, COLLECTIONS.PLANTILLAS, key))
    if (_cache) {
      delete _cache[key]
    }
  },

  invalidateCache() {
    _cache = null
  },
}
