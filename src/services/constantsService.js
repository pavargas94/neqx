import { doc, getDoc, setDoc } from 'firebase/firestore'
import { DEFAULT_CONSTANTS } from '../data/constants'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'

const COLLECTION = 'config'
const DOCUMENT = 'formConstants'

function normalizeConstants(data) {
  return {
    cirujanos: data.cirujanos ?? DEFAULT_CONSTANTS.cirujanos,
    ayudantes: data.ayudantes ?? DEFAULT_CONSTANTS.ayudantes,
    segundosCirujanos: data.segundosCirujanos ?? DEFAULT_CONSTANTS.segundosCirujanos,
    anestesiologos: data.anestesiologos ?? DEFAULT_CONSTANTS.anestesiologos,
    instrumentadores: data.instrumentadores ?? DEFAULT_CONSTANTS.instrumentadores,
    medicamentosLista: data.medicamentosLista ?? DEFAULT_CONSTANTS.medicamentosLista,
    muestrasDefault: data.muestrasDefault ?? DEFAULT_CONSTANTS.muestrasDefault,
    labelCirujano: data.labelCirujano ?? DEFAULT_CONSTANTS.labelCirujano,
  }
}

export const constantsService = {
  isConfigured: isFirebaseConfigured,

  async fetchFormConstants() {
    if (!isFirebaseConfigured()) {
      return { ...DEFAULT_CONSTANTS, source: 'local' }
    }

    const db = getFirestoreDb()
    const ref = doc(db, COLLECTION, DOCUMENT)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      try {
        await setDoc(ref, DEFAULT_CONSTANTS)
        return { ...DEFAULT_CONSTANTS, source: 'firestore' }
      } catch {
        return { ...DEFAULT_CONSTANTS, source: 'local' }
      }
    }

    return { ...normalizeConstants(snapshot.data()), source: 'firestore' }
  },
}
