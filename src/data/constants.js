import {
  buildCirujanosPorEspecialidadFromLegacy,
  deriveCirujanosFlat,
  deriveSegundosCirujanos,
} from '../utils/cirujanosHelpers'

const LEGACY_CIRUJANOS = {
  colelap: ['Dr. Juan Pérez', 'Dra. María Gómez'],
  histerectomia: [
    'Dr. Guillermo Ríos',
    'Dr. Pablo Enrique Hoyos',
    'Dra. Carolina Rendón',
    'Dra. Ana María Toro',
    'Dr. Fernando Felipe Paz',
  ],
  reemplazo: [
    'Dr. Mario Andres Insuasty',
    'Dr. Harold Losada',
    'Dr. Jorge Eduardo Quintero',
    'Dr. Jairo Ibarra Imbachi',
  ],
}

const LEGACY_SEGUNDOS_CIRUJANOS = [
  'Dr. Juan David Urrea',
  'Dr. Ricardo Niño',
  'Dr. David Cantillo',
  'Dr. Carlos David Segura',
  'Dr. Juan Carlos Aguirre',
  'Dr. Camilo Romero',
]

const cirujanosPorEspecialidad = buildCirujanosPorEspecialidadFromLegacy({
  cirujanos: LEGACY_CIRUJANOS,
  segundosCirujanos: LEGACY_SEGUNDOS_CIRUJANOS,
})

export const DEFAULT_CONSTANTS = {
  cirujanosPorEspecialidad,
  cirujanos: deriveCirujanosFlat(cirujanosPorEspecialidad),
  segundosCirujanos: deriveSegundosCirujanos(cirujanosPorEspecialidad),
  ayudantes: [
    { value: 'No aplica', label: '(No aplica)' },
    { value: 'Dr. Esteban Ortega', label: 'Dr. Esteban Ortega' },
    { value: 'Dra. Natalie Varela', label: 'Dra. Natalie Varela' },
    { value: 'Dra. Caroline Koga', label: 'Dra. Caroline Koga' },
    { value: 'Dra. Mayra Borrero', label: 'Dra. Mayra Borrero' },
    { value: 'Dr. Cristian Galán', label: 'Dr. Cristian Galán' },
    { value: 'Dr. Andrés Ruano', label: 'Dr. Andrés Ruano' },
    { value: 'Dra. Alejandra Arcila', label: 'Dra. Alejandra Arcila' },
  ],
  anestesiologos: [
    'Dr. Fernando Arboleda',
    'Dr. Julián Andrés Arroyave',
    'Dra. Dayana Ávila',
    'Dr. Roberto Antonio Calderón',
    'Dr. Alex Humberto Castro',
    'Dra. Alicia Carolina Lozano',
    'Dr. Carlos Andrés Luna',
    'Dr. Fernando Enrique Mejía',
    'Dr. Gonzalo Narváez',
    'Dr. Ubaldo Quintero',
    'Dr. Felipe Romero',
    'Dr. Lenin Oswaldo Rosales',
    'Dr. Andrés Felipe Salazar',
    'Dr. Jhon Edwar Sanclemente',
  ],
  instrumentadores: [
    'Alexander Benavides Aux',
    'Paula Gutiérrez',
    'Jesled Loaiza Soscue',
    'Juliana Ocampo Tobar',
    'Gisela Osorio Bedoya',
    'Liliam Perez Romero',
    'Diana Patricia Quintero',
    'Ruth Solano Ramirez',
    'Greis Solis Estacio',
    'Javier Mauricio Valencia',
  ],
  medicamentosLista: [
    { value: 'Dipirona 2.5gr EV', label: 'Dipirona 2.5gr' },
    { value: 'Dipirona 1gr EV', label: 'Dipirona 1gr' },
    { value: 'Paracetamol 1gr EV', label: 'Paracetamol 1gr' },
    { value: 'Ketorolaco 30mg EV', label: 'Ketorolaco 30mg' },
    { value: 'Diclofenaco 75mg EV', label: 'Diclofenaco 75mg' },
    { value: 'Nefopam 20mg EV', label: 'Nefopam 20mg' },
    { value: 'Tramal 50mg EV', label: 'Tramal 50mg' },
    { value: 'Tramal 100mg EV', label: 'Tramal 100mg' },
    { value: 'Ondansetrón 8mg EV', label: 'Ondansetrón 8mg' },
    { value: 'Ondansetrón 4mg EV', label: 'Ondansetrón 4mg' },
    { value: 'Metoclopramida 10mg EV', label: 'Metoclopramida 10mg' },
    { value: 'Dexametasona 8mg EV', label: 'Dexametasona 8mg' },
    { value: 'Hioscina 20mg EV', label: 'Hioscina 20mg' },
    { value: 'Omeprazol 40mg EV', label: 'Omeprazol 40mg' },
    { value: 'Ácido Tranexámico 1gr EV', label: 'Ácido Tranexámico 1gr' },
    { value: 'Dipirona 2.5gr / Hioscina 20mg EV', label: 'Dipirona 2.5g / Hioscina 20mg', span2: true },
  ],
  // Solo valores locales; no se persisten en Firestore.
  muestrasDefault: {
    colelap: 'vesícula biliar',
    histerectomia: 'útero y anexos',
    reemplazo: 'fragmentos óseos y tejido blando de rodilla',
  },
  labelCirujano: {
    colelap: 'Cirujano Principal:',
    histerectomia: 'Cirujano Ginecólogo:',
    reemplazo: 'Cirujano de Reemplazos:',
  },
}
