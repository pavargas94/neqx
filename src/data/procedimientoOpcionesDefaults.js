/**
 * Opciones y flags por defecto para procedimientos.
 * Se fusionan con los datos de Firestore cuando un procedimiento no define los suyos.
 *
 * opciones: campos dinámicos del formulario (select, text)
 *   - id: clave usada en {{id}} y {{idTexto}} en plantillas
 *   - tipo: 'select' | 'text'
 *   - opciones[].texto: valor narrativo para la nota ({{idTexto}})
 *
 * flags: comportamiento del procedimiento
 *   - segundoCirujano, bloqueoRegional, seccionGinecologia
 *   - anestesiaDefault, anestesiaFija
 */

export const OPCIONES_DEFAULTS = {
  reemplazo: [
    {
      id: 'tipoReemplazo',
      label: 'Clasificación del Procedimiento',
      tipo: 'select',
      grupo: 'Especificaciones del Reemplazo Articular',
      orden: 1,
      default: 'primario',
      opciones: [
        {
          value: 'primario',
          label: 'Reemplazo Total Primario de Rodilla',
          texto: 'reemplazo total primario de rodilla',
        },
        {
          value: 'revision',
          label: 'Revisión Protésica de Rodilla',
          texto: 'revisión protésica de rodilla',
        },
      ],
    },
    {
      id: 'lateralidadRodilla',
      label: 'Lateralidad Anatómica',
      tipo: 'select',
      grupo: 'Especificaciones del Reemplazo Articular',
      orden: 2,
      default: 'derecha',
      opciones: [
        { value: 'derecha', label: 'Derecha' },
        { value: 'izquierda', label: 'Izquierda' },
      ],
    },
    {
      id: 'casaMedica',
      label: 'Nombre de la Casa Médica Comercial',
      tipo: 'text',
      grupo: 'Especificaciones del Reemplazo Articular',
      orden: 3,
      default: '',
      placeholder: 'Ej: Stryker, Zimmer Biomet...',
    },
  ],

  hernias: [
    {
      id: 'tipoHernia',
      label: 'Tipo de hernia',
      tipo: 'select',
      grupo: 'Especificaciones de la Hernia',
      orden: 1,
      default: 'inguinal',
      opciones: [
        { value: 'inguinal', label: 'Hernia Inguinal', texto: 'hernia inguinal' },
        { value: 'femoral', label: 'Hernia Femoral', texto: 'hernia femoral' },
        { value: 'lateral', label: 'Hernia Lateral', texto: 'hernia lateral' },
        { value: 'umbilical', label: 'Hernia Umbilical', texto: 'hernia umbilical' },
        { value: 'epigastrica', label: 'Hernia Epigástrica', texto: 'hernia epigástrica' },
      ],
    },
  ],
}

export const FLAGS_DEFAULTS = {
  colelap: {
    anestesiaDefault: 'general',
    anestesiaFija: true,
  },
  histerectomia: {
    seccionGinecologia: true,
    anestesiaDefault: 'raquidea',
  },
  reemplazo: {
    segundoCirujano: true,
    bloqueoRegional: true,
    varianteAnestesia: 'reemplazo',
    anestesiaDefault: 'raquidea',
  },
  hernias: {
    anestesiaDefault: 'raquidea',
  },
}
