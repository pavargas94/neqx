import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_CONSTANTS } from '../data/constants'

const initialState = {
  tipoCirugia: 'reemplazo',
  sala: '4',
  tipoReemplazo: 'primario',
  lateralidadRodilla: 'derecha',
  casaMedica: '',

  hIngreso: '', hAnestesia: '', hLavado: '', hInicio: '',
  hMedicacion: '', hFinal: '', hTraslado: '',

  cGasas: 0, cCompresas: 0, cMechas: 0, cCotonoides: 0,

  cirujano: 'Dr. Mario Andres Insuasty',
  ayudante: 'Dr. Esteban Ortega',
  segundoCirujano: 'Dr. Juan David Urrea',
  anestesiologo: 'Dr. Fernando Arboleda',
  instrumentador: 'Alexander Benavides Aux',

  calibre: '18G',
  ubicacionVena: 'dorso de la mano',
  miembro: 'izquierdo',

  modalidadAnestesia: 'raquidea',
  anestApl: '27G',
  anestLocal: 'Bupirop 0.5% Pesada',
  anestAnalgesico: 'Morfina',
  mostrarBloqueo: false,
  hBloqueo: '',
  tipoBloqueo: 'el canal aductor',
  lateralidadBloqueo: 'derecho',
  volBloqueoLido: '',
  volBloqueoBupinest: '',
  volBloqueoBupirop: '',
  medsAnestesia: 'Propofol, Fentanilo, Rocuronio',
  tubo: '7.5',
  gas: 'Sevoflurane',
  hAnestesiaGeneral: '',

  placaBisturi: 'muslo derecho',
  tipoDrenaje: 'ninguno',
  muestraPatologia: 'no',
  nombreMuestra: 'fragmentos óseos y tejido blando de rodilla',

  sondaFoley: '16 Fr',
  caracteristicaOrina: 'clara',

  medicamentos: [],
  chkMorfina: false, dosMorfina: '',
  chkHidromorfona: false, dosHidromorfona: '',
  chkKetamina: false, dosKetamina: '',
  medsAdicional: '',

  novedades: [{ hora: '', descripcion: '' }],
}

function getConstants(getState) {
  return getState?.().constants?.data ?? DEFAULT_CONSTANTS
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setField(state, action) {
      const { field, value } = action.payload
      state[field] = value
    },
    applyCirugia(state, action) {
      const { cirugia, cirujanos, muestrasDefault } = action.payload
      const listaCirujanos = cirujanos[cirugia]
      const prevCirujano = state.cirujano
      state.tipoCirugia = cirugia
      state.cirujano = listaCirujanos.includes(prevCirujano) ? prevCirujano : listaCirujanos[0]
      state.nombreMuestra = muestrasDefault[cirugia]
      state.modalidadAnestesia = cirugia === 'colelap' ? 'general' : 'raquidea'
      if (cirugia !== 'reemplazo') state.mostrarBloqueo = false
    },
    setAnestesiaMode(state, action) {
      const modo = action.payload
      state.modalidadAnestesia = modo
    },
    conmutarAnestesia(state) {
      if (state.modalidadAnestesia === 'raquidea' || state.modalidadAnestesia === 'fallo_raquidea') {
        state.modalidadAnestesia = 'general'
      } else {
        state.modalidadAnestesia = 'raquidea'
      }
    },
    toggleBloqueo(state) {
      state.mostrarBloqueo = !state.mostrarBloqueo
    },
    activarFalloAnestesico(state) {
      state.modalidadAnestesia = 'fallo_raquidea'
    },
    toggleMedicamento(state, action) {
      const med = action.payload
      if (state.medicamentos.includes(med)) {
        state.medicamentos = state.medicamentos.filter(m => m !== med)
      } else {
        state.medicamentos.push(med)
      }
    },
    addNovedad(state) {
      state.novedades.push({ hora: '', descripcion: '' })
    },
    updateNovedad(state, action) {
      const { index, field, value } = action.payload
      if (state.novedades[index]) {
        state.novedades[index][field] = value
      }
    },
    applyLimpiarMismoEquipo(state, action) {
      const { cirugia, muestrasDefault } = action.payload
      return {
        ...state,
        hIngreso: '', hAnestesia: '', hLavado: '', hInicio: '',
        hMedicacion: '', hFinal: '', hTraslado: '',
        cGasas: 0, cCompresas: 0, cMechas: 0, cCotonoides: 0,
        casaMedica: '',
        tipoReemplazo: 'primario',
        lateralidadRodilla: 'derecha',
        calibre: '18G',
        ubicacionVena: 'dorso de la mano',
        miembro: 'izquierdo',
        modalidadAnestesia: cirugia === 'colelap' ? 'general' : 'raquidea',
        anestApl: '27G',
        mostrarBloqueo: false,
        hBloqueo: '',
        lateralidadBloqueo: 'derecho',
        volBloqueoLido: '', volBloqueoBupinest: '', volBloqueoBupirop: '',
        medsAnestesia: 'Propofol, Fentanilo, Rocuronio',
        tubo: '7.5',
        hAnestesiaGeneral: '',
        placaBisturi: 'muslo derecho',
        tipoDrenaje: 'ninguno',
        muestraPatologia: 'no',
        nombreMuestra: muestrasDefault[cirugia],
        sondaFoley: '16 Fr',
        caracteristicaOrina: 'clara',
        medicamentos: [],
        chkMorfina: false, dosMorfina: '',
        chkHidromorfona: false, dosHidromorfona: '',
        chkKetamina: false, dosKetamina: '',
        medsAdicional: '',
        novedades: [{ hora: '', descripcion: '' }],
      }
    },
    applyLimpiarDiferenteEquipo(state, action) {
      const { cirugia, cirujanos, muestrasDefault } = action.payload
      return {
        ...initialState,
        tipoCirugia: cirugia,
        cirujano: cirujanos[cirugia][0],
        nombreMuestra: muestrasDefault[cirugia],
        modalidadAnestesia: cirugia === 'colelap' ? 'general' : 'raquidea',
      }
    },
  },
})

export const {
  setField, setAnestesiaMode, conmutarAnestesia,
  toggleBloqueo, activarFalloAnestesico,
  toggleMedicamento, addNovedad, updateNovedad,
} = formSlice.actions

export const setCirugia = (cirugia) => (dispatch, getState) => {
  const { cirujanos, muestrasDefault } = getConstants(getState)
  dispatch(formSlice.actions.applyCirugia({ cirugia, cirujanos, muestrasDefault }))
}

export const limpiarMismoEquipo = () => (dispatch, getState) => {
  const cirugia = getState().form.tipoCirugia
  const { muestrasDefault } = getConstants(getState)
  dispatch(formSlice.actions.applyLimpiarMismoEquipo({ cirugia, muestrasDefault }))
}

export const limpiarDiferenteEquipo = () => (dispatch, getState) => {
  const cirugia = getState().form.tipoCirugia
  const { cirujanos, muestrasDefault } = getConstants(getState)
  dispatch(formSlice.actions.applyLimpiarDiferenteEquipo({ cirugia, cirujanos, muestrasDefault }))
}

export default formSlice.reducer
