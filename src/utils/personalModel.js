import { TIPOS_PERSONAL } from '../data/firestoreCollections'

export const CATEGORIAS_ORTOPEDIA = [
  'Segundo Cirujano',
  'Reemplazo articular',
  'Artroscopista',
]

export const TIPO_PERSONAL_LABELS = {
  [TIPOS_PERSONAL.CIRUJANO]: 'Cirujano',
  [TIPOS_PERSONAL.AYUDANTE]: 'Ayudante',
  [TIPOS_PERSONAL.ANESTESIOLOGO]: 'Anestesiólogo',
  [TIPOS_PERSONAL.INSTRUMENTADOR]: 'Instrumentador',
}

export function emptyCirujano(especialidadId = 'general', especialidades = []) {
  const esp = especialidades.find(e => e.id === especialidadId)
  return {
    id: null,
    nombre: '',
    tipo: TIPOS_PERSONAL.CIRUJANO,
    rol: esp?.rolNombre || esp?.nombre || '',
    especialidadId,
    categorias: [],
    activo: true,
  }
}

export function emptyAyudante() {
  return {
    id: null,
    nombre: '',
    label: '',
    tipo: TIPOS_PERSONAL.AYUDANTE,
    rol: null,
    especialidadId: null,
    categorias: [],
    activo: true,
  }
}

export function emptySimpleMember(tipo) {
  return {
    id: null,
    nombre: '',
    tipo,
    rol: null,
    especialidadId: null,
    categorias: [],
    activo: true,
  }
}

export function normalizeCirujanoDraft(member, especialidades) {
  const esp = especialidades.find(e => e.id === member.especialidadId)
  return {
    ...member,
    nombre: member.nombre?.trim() || '',
    rol: member.rol?.trim() || esp?.rolNombre || esp?.nombre || '',
    especialidadId: member.especialidadId || null,
    categorias: member.especialidadId === 'ortopedia'
      ? (member.categorias || []).filter(c => CATEGORIAS_ORTOPEDIA.includes(c))
      : [],
  }
}

export function normalizeAyudanteDraft(member) {
  const nombre = member.nombre?.trim() || ''
  return {
    ...member,
    nombre,
    label: member.label?.trim() || nombre,
  }
}

export function normalizeSimpleDraft(member) {
  return {
    ...member,
    nombre: member.nombre?.trim() || '',
  }
}
