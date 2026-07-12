/**
 * Configuración central de especialidades médicas y sus cirugías.
 * Para agregar una nueva especialidad, añádela aquí con sus cirugías.
 */
export const ESPECIALIDADES = [
  {
    key: 'general',
    label: 'Cirujanos generales',
    description: 'Procedimientos de cirugía general.',
    cirugias: [
      { key: 'colelap', label: 'Colecistectomía laparoscópica', formKey: 'colelap' },
      { key: 'hernias', label: 'Hernias', formKey: 'hernias' },
    ],
  },
  {
    key: 'ortopedia',
    label: 'Ortopedistas',
    description: 'Artroscopistas, segundos cirujanos y reemplazos articulares.',
    cirugias: [
      { key: 'artroscopia', label: 'Artroscopistas' },
      { key: 'segundoCirujano', label: 'Segundos cirujanos', formSegundoCirujano: true },
      { key: 'reemplazo', label: 'Reemplazos articulares', formKey: 'reemplazo' },
    ],
  },
  {
    key: 'ginecologia',
    label: 'Ginecólogos',
    description: 'Procedimientos ginecológicos.',
    cirugias: [
      { key: 'histerectomia', label: 'Histerectomía abdominal', formKey: 'histerectomia' },
    ],
  },
]
