/**
 * Servicio de población inicial (seed) de Firestore.
 * Migra datos locales o personal/settings existente hacia las nuevas colecciones.
 *
 * Uso recomendado: panel admin → /admin/poblar-datos (una sola vez).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { DEFAULT_PLANTILLAS } from '../data/plantillasDefaults'
import {
  COLLECTIONS,
  DOCUMENTS,
  TIPOS_PERSONAL,
} from '../data/firestoreCollections'
import { ESPECIALIDADES } from '../data/especialidades'
import { constantsService } from './constantsService'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'
import { plantillasService } from './plantillasService'

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

const CATEGORIA_POR_CIRUGIA = {
  segundoCirujano: 'Segundo Cirujano',
  reemplazo: 'Reemplazo articular',
  artroscopia: 'Artroscopista',
}

function buildEspecialidadesPayload() {
  return ESPECIALIDADES.map((esp, idx) => ({
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

import { personalDocId } from '../utils/personalAdapter'

function buildCirujanosFromConstants(constants) {
  const cirujanosPorEspecialidad = constants.cirujanosPorEspecialidad || {}
  const map = new Map()

  for (const esp of ESPECIALIDADES) {
    const cirugiasData = cirujanosPorEspecialidad[esp.key] || {}

    for (const cirugia of esp.cirugias) {
      const nombres = cirugiasData[cirugia.key] || []
      const categoria = CATEGORIA_POR_CIRUGIA[cirugia.key]

      for (const nombreRaw of nombres) {
        const nombre = nombreRaw.trim()
        if (!nombre) continue

        const mapKey = `${esp.key}::${nombre}`
        const existing = map.get(mapKey) || {
          nombre,
          tipo: TIPOS_PERSONAL.CIRUJANO,
          rol: esp.label,
          especialidadId: esp.key,
          categorias: [],
          activo: true,
        }

        if (categoria && !existing.categorias.includes(categoria)) {
          existing.categorias.push(categoria)
        }

        map.set(mapKey, existing)
      }
    }
  }

  return [...map.values()]
}

function buildPersonalFromConstants(constants) {
  const personal = [...buildCirujanosFromConstants(constants)]

  for (const item of constants.ayudantes || []) {
    const nombre = (item.value || item.label || '').trim()
    if (!nombre) continue
    personal.push({
      nombre,
      tipo: TIPOS_PERSONAL.AYUDANTE,
      rol: null,
      especialidadId: null,
      categorias: [],
      activo: true,
      label: item.label || nombre,
    })
  }

  for (const nombreRaw of constants.anestesiologos || []) {
    const nombre = nombreRaw.trim()
    if (!nombre) continue
    personal.push({
      nombre,
      tipo: TIPOS_PERSONAL.ANESTESIOLOGO,
      rol: null,
      especialidadId: null,
      categorias: [],
      activo: true,
    })
  }

  for (const nombreRaw of constants.instrumentadores || []) {
    const nombre = nombreRaw.trim()
    if (!nombre) continue
    personal.push({
      nombre,
      tipo: TIPOS_PERSONAL.INSTRUMENTADOR,
      rol: null,
      especialidadId: null,
      categorias: [],
      activo: true,
    })
  }

  return personal
}

async function collectionIsEmpty(db, collectionName) {
  const snap = await getDocs(collection(db, collectionName))
  return snap.empty
}

async function countPersonalDocs(db) {
  const snap = await getDocs(collection(db, COLLECTIONS.PERSONAL))
  return snap.docs.filter(d => d.id !== DOCUMENTS.SETTINGS).length
}

export const seedService = {
  isConfigured: isFirebaseConfigured,

  async getStatus() {
    if (!isFirebaseConfigured()) {
      return { configured: false }
    }

    const db = getFirestoreDb()
    const [espSnap, plantSnap, personalCount] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.ESPECIALIDADES)),
      getDocs(collection(db, COLLECTIONS.PLANTILLAS)),
      countPersonalDocs(db),
    ])

    return {
      configured: true,
      especialidades: espSnap.size,
      plantillas: plantSnap.size,
      personal: personalCount,
      hasLegacySettings: (await getDoc(doc(db, COLLECTIONS.PERSONAL, DOCUMENTS.SETTINGS))).exists(),
    }
  },

  /**
   * Pobla especialidades, plantillas y personal (nuevo modelo).
   * @param {{ force?: boolean, includePersonal?: boolean }} options
   */
  async seedAll(options = {}) {
    const { force = false, includePersonal = true } = options

    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado.')
    }

    const db = getFirestoreDb()
    const results = {
      especialidades: 0,
      plantillas: 0,
      personal: 0,
      skipped: [],
    }

    // ── Especialidades ──────────────────────────────────────────────────────
    const espEmpty = await collectionIsEmpty(db, COLLECTIONS.ESPECIALIDADES)
    if (espEmpty || force) {
      const especialidades = buildEspecialidadesPayload()
      await Promise.all(
        especialidades.map(esp =>
          setDoc(doc(db, COLLECTIONS.ESPECIALIDADES, esp.id), {
            nombre: esp.nombre,
            descripcion: esp.descripcion,
            rolNombre: esp.rolNombre,
            orden: esp.orden,
            procedimientos: esp.procedimientos,
            creadoEn: serverTimestamp(),
            actualizadoEn: serverTimestamp(),
          }),
        ),
      )
      results.especialidades = especialidades.length
    } else {
      results.skipped.push('especialidades')
    }

    // ── Plantillas ──────────────────────────────────────────────────────────
    const plantEmpty = await collectionIsEmpty(db, COLLECTIONS.PLANTILLAS)
    if (plantEmpty || force) {
      const keys = Object.keys(DEFAULT_PLANTILLAS)
      await Promise.all(
        keys.map(key =>
          setDoc(doc(db, COLLECTIONS.PLANTILLAS, key), {
            ...DEFAULT_PLANTILLAS[key],
            actualizadoEn: serverTimestamp(),
          }),
        ),
      )
      results.plantillas = keys.length
      plantillasService.invalidateCache()
      await plantillasService.preload()
    } else {
      results.skipped.push('plantillas')
    }

    // ── Personal (documentos individuales) ──────────────────────────────────
    if (includePersonal) {
      const personalCount = await countPersonalDocs(db)
      if (personalCount === 0 || force) {
        const constants = await constantsService.fetchFormConstants()
        const personalItems = buildPersonalFromConstants(constants)

        await Promise.all(
          personalItems.map(item => {
            const id = personalDocId(item.tipo, item.nombre, item.especialidadId)
            const { label, ...data } = item
            return setDoc(doc(db, COLLECTIONS.PERSONAL, id), {
              ...data,
              ...(label ? { label } : {}),
              creadoEn: serverTimestamp(),
              actualizadoEn: serverTimestamp(),
            })
          }),
        )
        results.personal = personalItems.length
      } else {
        results.skipped.push('personal')
      }
    }

    return results
  },
}
