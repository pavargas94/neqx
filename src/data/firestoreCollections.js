export const COLLECTIONS = {
  USERS: 'users',
  PERSONAL: 'personal',
  MEDICACION: 'medicacion',
  CONFIG: 'config',
  ESPECIALIDADES: 'especialidades',
  PLANTILLAS: 'plantillas',
}

export const DOCUMENTS = {
  SETTINGS: 'settings',
  LEGACY_FORM_CONSTANTS: 'formConstants',
  BOOTSTRAP_ADMINS: 'bootstrapAdmins',
  PLANTILLA_ANESTESIA: '_anestesia',
  PLANTILLA_CONFIG: '_config',
}

export const PERSONAL_KEYS = [
  'cirujanosPorEspecialidad',
  'ayudantes',
  'anestesiologos',
  'instrumentadores',
  'labelCirujano',
]

export const MEDICACION_KEYS = ['medicamentosLista']

// Nuevo modelo: tipos de personal para documentos individuales
export const TIPOS_PERSONAL = {
  CIRUJANO: 'cirujano',
  AYUDANTE: 'ayudante',
  ANESTESIOLOGO: 'anestesiologo',
  INSTRUMENTADOR: 'instrumentador',
}
