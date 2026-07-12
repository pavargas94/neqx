export const NAV_MENUS = [
  {
    id: 'notas',
    label: 'Notas',
    items: [
      { id: 'formulario', label: 'Formulario de notas', path: '/', end: true },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    adminOnly: true,
    items: [
      { id: 'cirujanos', label: 'Cirujanos', path: '/admin/cirujanos' },
      { id: 'ayudantes', label: 'Ayudantes', path: '/admin/ayudantes' },
      { id: 'segundosCirujanos', label: 'Segundos cirujanos', path: '/admin/segundos-cirujanos' },
      { id: 'anestesiologos', label: 'Anestesiólogos', path: '/admin/anestesiologos' },
      { id: 'instrumentadores', label: 'Instrumentadores', path: '/admin/instrumentadores' },
    ],
  },
  {
    id: 'medicacion',
    label: 'Medicación',
    adminOnly: true,
    items: [
      { id: 'medicamentos', label: 'Medicamentos en sala', path: '/admin/medicamentos' },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    adminOnly: true,
    items: [
      { id: 'muestras', label: 'Muestras de patología', path: '/admin/muestras' },
      { id: 'labels', label: 'Etiquetas de cirujano', path: '/admin/etiquetas' },
    ],
  },
]

// Compatibilidad con rutas admin existentes
export const ADMIN_NAV_SECTIONS = NAV_MENUS
  .filter(menu => menu.adminOnly)
  .flatMap(menu => menu.items)
