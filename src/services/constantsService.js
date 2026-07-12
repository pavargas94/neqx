import { doc, getDoc, setDoc } from 'firebase/firestore'
import { DEFAULT_CONSTANTS } from '../data/constants'
import {
  COLLECTIONS,
  DOCUMENTS,
  MEDICACION_KEYS,
  PERSONAL_KEYS,
} from '../data/firestoreCollections'
import {
  deriveCirujanosFlat,
  deriveSegundosCirujanos,
  migrateCirujanosPorEspecialidad,
} from '../utils/cirujanosHelpers'
import {
  buildFormConstantsFromPersonal,
  deriveProcedureMetadata,
} from '../utils/personalAdapter'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { personalService } from './personalService'
import { especialidadesService } from './especialidadesService'

function pickFields(data, keys) {
  return Object.fromEntries(keys.map(key => [key, data[key]]))
}

function normalizeLegacyConstants(personalData = {}, medicacionData = {}, especialidadesList = []) {
  const merged = { ...personalData, ...medicacionData }
  const cirujanosPorEspecialidad = migrateCirujanosPorEspecialidad(merged, especialidadesList)
  const { labelCirujano, muestrasDefault } = deriveProcedureMetadata(especialidadesList)

  return {
    cirujanosPorEspecialidad,
    cirujanos: deriveCirujanosFlat(cirujanosPorEspecialidad, especialidadesList),
    segundosCirujanos: deriveSegundosCirujanos(cirujanosPorEspecialidad),
    ayudantes: personalData.ayudantes ?? DEFAULT_CONSTANTS.ayudantes,
    anestesiologos: personalData.anestesiologos ?? DEFAULT_CONSTANTS.anestesiologos,
    instrumentadores: personalData.instrumentadores ?? DEFAULT_CONSTANTS.instrumentadores,
    labelCirujano: personalData.labelCirujano ?? labelCirujano,
    medicamentosLista: medicacionData.medicamentosLista ?? DEFAULT_CONSTANTS.medicamentosLista,
    muestrasDefault,
    especialidades: especialidadesList,
  }
}

function splitLegacyForFirestore(data) {
  const normalized = normalizeLegacyConstants(data, data)

  return {
    personal: pickFields(normalized, PERSONAL_KEYS),
    medicacion: pickFields(normalized, MEDICACION_KEYS),
  }
}

async function readLegacyFormConstants(db) {
  const ref = doc(db, COLLECTIONS.CONFIG, DOCUMENTS.LEGACY_FORM_CONSTANTS)
  const snapshot = await getDoc(ref)
  return snapshot.exists() ? snapshot.data() : null
}

async function migrateLegacyToCollections(db, legacyData) {
  const { personal, medicacion } = splitLegacyForFirestore(legacyData)

  await Promise.all([
    setDoc(doc(db, COLLECTIONS.PERSONAL, DOCUMENTS.SETTINGS), personal),
    setDoc(doc(db, COLLECTIONS.MEDICACION, DOCUMENTS.SETTINGS), medicacion),
  ])
}

async function fetchMedicacionData(db) {
  const medicacionRef = doc(db, COLLECTIONS.MEDICACION, DOCUMENTS.SETTINGS)
  const medicacionSnap = await getDoc(medicacionRef)
  return medicacionSnap.exists() ? medicacionSnap.data() : {}
}

async function fetchLegacyPersonalData(db) {
  const personalRef = doc(db, COLLECTIONS.PERSONAL, DOCUMENTS.SETTINGS)
  const personalSnap = await getDoc(personalRef)
  return personalSnap.exists() ? personalSnap.data() : null
}

export const constantsService = {
  isConfigured: isFirebaseConfigured,

  async fetchFormConstants() {
    const especialidadesList = await especialidadesService.fetchAll()

    if (!isFirebaseConfigured()) {
      const { labelCirujano, muestrasDefault } = deriveProcedureMetadata(especialidadesList)
      return {
        ...DEFAULT_CONSTANTS,
        labelCirujano,
        muestrasDefault,
        especialidades: especialidadesList,
        source: 'local',
      }
    }

    const db = getFirestoreDb()
    const [personalDocs, medicacionData] = await Promise.all([
      personalService.fetchAll(),
      fetchMedicacionData(db),
    ])

    if (personalDocs.length > 0) {
      return {
        ...buildFormConstantsFromPersonal(personalDocs, especialidadesList, medicacionData),
        source: 'firestore',
      }
    }

    const legacyPersonal = await fetchLegacyPersonalData(db)
    if (legacyPersonal) {
      return {
        ...normalizeLegacyConstants(legacyPersonal, medicacionData, especialidadesList),
        source: 'firestore',
      }
    }

    const legacyData = await readLegacyFormConstants(db)
    if (legacyData) {
      await migrateLegacyToCollections(db, legacyData)
      const { personal, medicacion } = splitLegacyForFirestore(legacyData)
      return {
        ...normalizeLegacyConstants(personal, medicacion, especialidadesList),
        source: 'firestore',
      }
    }

    const { labelCirujano, muestrasDefault } = deriveProcedureMetadata(especialidadesList)
    return {
      ...DEFAULT_CONSTANTS,
      labelCirujano,
      muestrasDefault,
      medicamentosLista:
        medicacionData.medicamentosLista ?? DEFAULT_CONSTANTS.medicamentosLista,
      especialidades: especialidadesList,
      source: 'local',
    }
  },

  async updateFormConstants(data) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const db = getFirestoreDb()
    const medicacion = pickFields(data, MEDICACION_KEYS)

    await setDoc(doc(db, COLLECTIONS.MEDICACION, DOCUMENTS.SETTINGS), medicacion)

    const result = await this.fetchFormConstants()
    const { source, ...rest } = result
    return rest
  },
}
