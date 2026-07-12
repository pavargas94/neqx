import { getProcedimientoConfig } from './procedimientoOpciones'

/** Variables estáticas disponibles en el generador de notas. */
export const VARIABLES_ESTATICAS = [
  {
    grupo: 'Horarios',
    variables: [
      { key: 'h1', descripcion: 'Hora de ingreso' },
      { key: 'h2', descripcion: 'Hora de anestesia' },
      { key: 'h3', descripcion: 'Hora de lavado quirúrgico' },
      { key: 'h4', descripcion: 'Hora de inicio de cirugía' },
      { key: 'h5', descripcion: 'Hora de medicación' },
      { key: 'h6', descripcion: 'Hora de final de cirugía' },
      { key: 'h7', descripcion: 'Hora de traslado' },
      { key: 'hAnestesiaGeneral', descripcion: 'Hora conversión a anestesia general' },
      { key: 'hBloqueo', descripcion: 'Hora de bloqueo regional' },
    ],
  },
  {
    grupo: 'Procedimiento y sala',
    variables: [
      { key: 'sala', descripcion: 'Número de sala quirúrgica' },
      { key: 'tipoCirugia', descripcion: 'Clave del procedimiento' },
    ],
  },
  {
    grupo: 'Personal en sala',
    variables: [
      { key: 'cirujano', descripcion: 'Cirujano principal' },
      { key: 'ayudante', descripcion: 'Médico ayudante' },
      { key: 'textoAyudante', descripcion: 'Frase " en conjunto con …" (vacía si no aplica)' },
      { key: 'segundoCirujano', descripcion: 'Segundo cirujano (ortopedia)' },
      { key: 'personaLavado', descripcion: 'Quien realiza el lavado quirúrgico' },
      { key: 'anestesiologo', descripcion: 'Anestesiólogo' },
      { key: 'instrumentador', descripcion: 'Instrumentador(a)' },
    ],
  },
  {
    grupo: 'Acceso venoso y seguridad',
    variables: [
      { key: 'calibre', descripcion: 'Calibre del catéter venoso' },
      { key: 'ubicacionVena', descripcion: 'Ubicación del acceso venoso' },
      { key: 'miembro', descripcion: 'Miembro del acceso venoso' },
      { key: 'placaBisturi', descripcion: 'Ubicación placa de bisturí' },
      { key: 'tipoDrenaje', descripcion: 'Tipo de drenaje seleccionado' },
      { key: 'textoDrenajeFinal', descripcion: 'Texto de drenaje para sección final' },
      { key: 'textoDrenajeFinalSinComa', descripcion: 'Texto de drenaje sin coma final' },
      { key: 'muestraPatologia', descripcion: 'Si hay muestra de patología' },
      { key: 'textoPatologiaFinal', descripcion: 'Párrafo de espécimen patológico' },
    ],
  },
  {
    grupo: 'Material y medicación',
    variables: [
      { key: 'stringConteoMaterial', descripcion: 'Conteo de gasas, compresas, mechas, cotonoides' },
      { key: 'stringMedsFinal', descripcion: 'Medicamentos intraoperatorios administrados' },
    ],
  },
  {
    grupo: 'Ginecología',
    variables: [
      { key: 'sondaFoley', descripcion: 'Calibre sonda Foley' },
      { key: 'caracteristicaOrina', descripcion: 'Característica de la orina' },
    ],
  },
  {
    grupo: 'Reemplazo articular (opciones)',
    variables: [
      { key: 'tipoReemplazo', descripcion: 'Clave: primario / revision' },
      { key: 'tipoReemplazoTexto', descripcion: 'Texto narrativo del tipo de reemplazo' },
      { key: 'lateralidadRodilla', descripcion: 'Lateralidad: derecha / izquierda' },
      { key: 'casa', descripcion: 'Casa médica comercial' },
      { key: 'casaMedica', descripcion: 'Alias de casa médica (opción dinámica)' },
    ],
  },
  {
    grupo: 'Traslado y anestesia residual',
    variables: [
      { key: 'sufijoAnestesiaRecup', descripcion: 'Sufijo de anestesia en traslado' },
    ],
  },
]

/** Variables usadas en plantillas de anestesia (_anestesia). */
export const VARIABLES_ANESTESIA = [
  {
    grupo: 'Anestesia compartida',
    variables: [
      { key: 'h2', descripcion: 'Hora de anestesia' },
      { key: 'hAnestesiaGeneral', descripcion: 'Hora conversión a general' },
      { key: 'hBloqueo', descripcion: 'Hora de bloqueo regional' },
      { key: 'anestesiologo', descripcion: 'Anestesiólogo' },
      { key: 'anestApl', descripcion: 'Calibre aguja APL' },
      { key: 'anestLocal', descripcion: 'Anestésico local' },
      { key: 'anestAnalgesico', descripcion: 'Analgésico intratecal' },
      { key: 'medsAnestesia', descripcion: 'Medicamentos de inducción' },
      { key: 'tubo', descripcion: 'Número de tubo orotraqueal' },
      { key: 'gas', descripcion: 'Gas anestésico' },
      { key: 'tipoBloqueo', descripcion: 'Tipo de bloqueo regional' },
      { key: 'lateralidadBloqueo', descripcion: 'Lateralidad del bloqueo' },
      { key: 'lateralidadRodilla', descripcion: 'Lateralidad rodilla (reemplazo)' },
      { key: 'stringAnestBloqueo', descripcion: 'Fármacos del bloqueo regional' },
    ],
  },
]

/**
 * Variables dinámicas configuradas en Firestore para un procedimiento.
 * Incluye {{id}} y {{idTexto}} para selects.
 */
export function buildVariablesDinamicas(especialidades, procedureKey) {
  if (!procedureKey) return []

  const procConfig = getProcedimientoConfig(especialidades, procedureKey)
  const variables = []

  for (const opt of procConfig.opciones || []) {
    if (!opt.id) continue
    variables.push({
      key: opt.id,
      descripcion: opt.label || opt.id,
      dinamica: true,
      procedimiento: procedureKey,
    })
    if (opt.tipo === 'select') {
      variables.push({
        key: `${opt.id}Texto`,
        descripcion: `${opt.label || opt.id} — texto narrativo`,
        dinamica: true,
        procedimiento: procedureKey,
      })
    }
  }

  return variables
}

/**
 * Catálogo completo para el editor de plantillas de procedimiento.
 */
export function buildCatalogoProcedimiento(especialidades, procedureKey) {
  const dinamicas = buildVariablesDinamicas(especialidades, procedureKey)
  const dinamicaKeys = new Set(dinamicas.map(v => v.key))

  const estaticasFiltradas = VARIABLES_ESTATICAS.map(grupo => ({
    ...grupo,
    variables: grupo.variables.filter(v => !dinamicaKeys.has(v.key)),
  })).filter(grupo => grupo.variables.length > 0)

  const grupos = [...estaticasFiltradas]

  if (dinamicas.length > 0) {
    grupos.unshift({
      grupo: `Campos adicionales — ${procedureKey}`,
      variables: dinamicas,
      esDinamico: true,
    })
  }

  return grupos
}

export function formatVariable(key) {
  return `{{${key}}}`
}
