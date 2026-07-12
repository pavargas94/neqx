import { useDispatch, useSelector } from 'react-redux'
import { limpiarMismoEquipo, limpiarDiferenteEquipo } from '../store/formSlice'
import { setNota, limpiarNota } from '../store/reportSlice'
import { validarFormulario, generarReporte } from '../utils/reportGenerator'

import ProcedureSection from './sections/ProcedureSection'
import ScheduleSection from './sections/ScheduleSection'
import MaterialSection from './sections/MaterialSection'
import StaffSection from './sections/StaffSection'
import VenousSection from './sections/VenousSection'
import AnesthesiaSection from './sections/AnesthesiaSection'
import SafetySection from './sections/SafetySection'
import GynecologySection from './sections/GynecologySection'
import MedicationSection from './sections/MedicationSection'
import EventsSection from './sections/EventsSection'

export default function FormPanel() {
  const dispatch = useDispatch()
  const form = useSelector(s => s.form)

  function handleGenerar() {
    const error = validarFormulario(form)
    if (error) {
      alert(error)
      return
    }
    const nota = generarReporte(form)
    dispatch(setNota(nota))
  }

  function handleMismoEquipo() {
    dispatch(limpiarMismoEquipo())
    dispatch(limpiarNota())
  }

  function handleDiferenteEquipo() {
    dispatch(limpiarDiferenteEquipo())
    dispatch(limpiarNota())
  }

  return (
    <div className="panel-formulario">
      <ProcedureSection />
      <ScheduleSection />
      <MaterialSection />
      <StaffSection />
      <VenousSection />
      <AnesthesiaSection />
      <SafetySection />
      <GynecologySection />
      <MedicationSection />
      <EventsSection />

      <button className="btn-generar" onClick={handleGenerar}>
        ⚡ GENERAR NOTA INTEGRAL
      </button>
      <button className="btn-mismo-equipo" onClick={handleMismoEquipo}>
        Nueva de la misma jornada
      </button>
      <button className="btn-diferente-equipo" onClick={handleDiferenteEquipo}>
        Cambio de turno / Nuevo equipo
      </button>
    </div>
  )
}
