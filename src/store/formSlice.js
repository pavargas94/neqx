import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_CONSTANTS } from '../data/constants'
import {
  findEspecialidadByProcedure,
  pickDefaultProcedureKey,
} from '../utils/procedimientosHelpers'
import { OPCIONES_DEFAULTS } from '../data/procedimientoOpcionesDefaults'
import {
  getDefaultOpciones,
  getProcedimientoConfig,
} from '../utils/procedimientoOpciones'
import { pickDefaultCirujano } from '../utils/cirujanosHelpers'

const initialState = {
  especialidadId: 'ortopedia',
  tipoCirugia: 'reemplazo',
  sala: '4',
  opcionesProcedimiento: getDefaultOpciones(OPCIONES_DEFAULTS.reemplazo),

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

function applyProcedimientoConfig(state, cirugia, especialidades) {
  const procConfig = getProcedimientoConfig(especialidades, cirugia)
  state.opcionesProcedimiento = getDefaultOpciones(procConfig.opciones)
  const flags = procConfig.flags || {}
  state.modalidadAnestesia = flags.anestesiaDefault
    ?? (cirugia === 'colelap' ? 'general' : 'raquidea')
  if (!flags.bloqueoRegional) state.mostrarBloqueo = false
}

function applyStaffForContext(state, { especialidadId, cirugia, constants, especialidades }) {
  const procConfig = getProcedimientoConfig(especialidades, cirugia)
  state.cirujano = pickDefaultCirujano(constants, especialidadId, cirugia, '')

  if (procConfig.flags?.segundoCirujano) {
    state.segundoCirujano = constants.segundosCirujanos?.[0] || ''
  } else {
    state.segundoCirujano = ''
  }
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setField(state, action) {
      const { field, value } = action.payload
      state[field] = value
    },
    setOpcionProcedimiento(state, action) {
      const { id, value } = action.payload
      state.opcionesProcedimiento[id] = value
    },
    applyCirugia(state, action) {
      const { cirugia, especialidadId, constants, muestrasDefault, especialidades } = action.payload
      if (especialidadId) state.especialidadId = especialidadId
      state.tipoCirugia = cirugia
      state.nombreMuestra = muestrasDefault[cirugia]
      applyProcedimientoConfig(state, cirugia, especialidades)
      applyStaffForContext(state, {
        especialidadId: state.especialidadId,
        cirugia,
        constants,
        especialidades,
      })
    },
    applyEspecialidad(state, action) {
      const { especialidadId, cirugia, constants, muestrasDefault, especialidades } = action.payload
      state.especialidadId = especialidadId
      state.tipoCirugia = cirugia
      state.nombreMuestra = muestrasDefault[cirugia] || ''
      applyProcedimientoConfig(state, cirugia, especialidades)
      applyStaffForContext(state, {
        especialidadId,
        cirugia,
        constants,
        especialidades,
      })
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
      const { cirugia, muestrasDefault, especialidades } = action.payload
      const procConfig = getProcedimientoConfig(especialidades, cirugia)
      const flags = procConfig.flags || {}
      return {
        ...state,
        hIngreso: '', hAnestesia: '', hLavado: '', hInicio: '',
        hMedicacion: '', hFinal: '', hTraslado: '',
        cGasas: 0, cCompresas: 0, cMechas: 0, cCotonoides: 0,
        opcionesProcedimiento: getDefaultOpciones(procConfig.opciones),
        calibre: '18G',
        ubicacionVena: 'dorso de la mano',
        miembro: 'izquierdo',
        modalidadAnestesia: flags.anestesiaDefault
          ?? (cirugia === 'colelap' ? 'general' : 'raquidea'),
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
      const { cirugia, especialidadId, constants, muestrasDefault, especialidades } = action.payload
      const procConfig = getProcedimientoConfig(especialidades, cirugia)
      const flags = procConfig.flags || {}
      const next = {
        ...initialState,
        especialidadId,
        tipoCirugia: cirugia,
        nombreMuestra: muestrasDefault[cirugia],
        opcionesProcedimiento: getDefaultOpciones(procConfig.opciones),
        modalidadAnestesia: flags.anestesiaDefault
          ?? (cirugia === 'colelap' ? 'general' : 'raquidea'),
      }
      applyStaffForContext(next, { especialidadId, cirugia, constants, especialidades })
      return next
    },
  },
})

export const {
  setField, setOpcionProcedimiento, setAnestesiaMode, conmutarAnestesia,
  toggleBloqueo, activarFalloAnestesico,
  toggleMedicamento, addNovedad, updateNovedad,
} = formSlice.actions

export const setCirugia = (cirugia) => (dispatch, getState) => {
  const constants = getConstants(getState)
  const esp = findEspecialidadByProcedure(constants.especialidades, cirugia)
  dispatch(formSlice.actions.applyCirugia({
    cirugia,
    especialidadId: esp?.id || getState().form.especialidadId,
    constants,
    muestrasDefault: constants.muestrasDefault,
    especialidades: constants.especialidades,
  }))
}

export const setEspecialidad = (especialidadId) => (dispatch, getState) => {
  const constants = getConstants(getState)
  const esp = (constants.especialidades || []).find(e => e.id === especialidadId)
  const cirugia = pickDefaultProcedureKey(esp, getState().form.tipoCirugia)
  dispatch(formSlice.actions.applyEspecialidad({
    especialidadId,
    cirugia,
    constants,
    muestrasDefault: constants.muestrasDefault,
    especialidades: constants.especialidades,
  }))
}

export const limpiarMismoEquipo = () => (dispatch, getState) => {
  const { tipoCirugia } = getState().form
  const constants = getConstants(getState)
  dispatch(formSlice.actions.applyLimpiarMismoEquipo({
    cirugia: tipoCirugia,
    muestrasDefault: constants.muestrasDefault,
    especialidades: constants.especialidades,
  }))
}

export const limpiarDiferenteEquipo = () => (dispatch, getState) => {
  const { tipoCirugia, especialidadId } = getState().form
  const constants = getConstants(getState)
  dispatch(formSlice.actions.applyLimpiarDiferenteEquipo({
    cirugia: tipoCirugia,
    especialidadId,
    constants,
    muestrasDefault: constants.muestrasDefault,
    especialidades: constants.especialidades,
  }))
}

export default formSlice.reducer
