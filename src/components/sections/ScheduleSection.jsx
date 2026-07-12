import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'
import { formatearEntradaHora, soloNumerosYColon } from '../../utils/timeUtils'

const CAMPOS_HORARIO = [
  { field: 'hIngreso', label: '1. Ingreso' },
  { field: 'hAnestesia', label: '2. Anestesia' },
  { field: 'hLavado', label: '3. Lavado' },
  { field: 'hInicio', label: '4. Inicio Cx' },
  { field: 'hMedicacion', label: '5. Medicación' },
  { field: 'hFinal', label: '6. Final Cx' },
  { field: 'hTraslado', label: '7. Traslado' },
]

function HoraInput({ fieldName, label }) {
  const dispatch = useDispatch()
  const valor = useSelector(s => s.form[fieldName])

  function handleChange(e) {
    dispatch(setField({ field: fieldName, value: soloNumerosYColon(e.target.value) }))
  }

  function handleBlur(e) {
    const resultado = formatearEntradaHora(e.target.value)
    if (resultado === null) {
      alert('Hora inválida. Rango militar: 00:00 a 23:59')
      dispatch(setField({ field: fieldName, value: '' }))
    } else {
      dispatch(setField({ field: fieldName, value: resultado }))
    }
  }

  return (
    <div className="campo">
      <label>{label}:</label>
      <input
        type="text"
        className="hora-militar"
        placeholder="HH:MM"
        maxLength={5}
        value={valor}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  )
}

export default function ScheduleSection() {
  const fila1 = CAMPOS_HORARIO.slice(0, 3)
  const fila2 = CAMPOS_HORARIO.slice(3)

  return (
    <>
      <h3>Horarios Quirúrgicos</h3>
      <div className="fila">
        {fila1.map(c => <HoraInput key={c.field} fieldName={c.field} label={c.label} />)}
      </div>
      <div className="fila">
        {fila2.map(c => <HoraInput key={c.field} fieldName={c.field} label={c.label} />)}
      </div>
    </>
  )
}
