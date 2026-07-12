import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'

const CAMPOS = [
  { field: 'cGasas', label: 'Gasas' },
  { field: 'cCompresas', label: 'Compresas' },
  { field: 'cMechas', label: 'Mechas' },
  { field: 'cCotonoides', label: 'Cotonoides' },
]

export default function MaterialSection() {
  const dispatch = useDispatch()
  const form = useSelector(s => s.form)

  return (
    <>
      <h3>Conteo de Material Blanco</h3>
      <div className="fila">
        {CAMPOS.map(c => (
          <div className="campo" key={c.field}>
            <label>{c.label}:</label>
            <input
              type="number"
              className="input-conteo"
              value={form[c.field]}
              min={0}
              onChange={e => dispatch(setField({ field: c.field, value: parseInt(e.target.value) || 0 }))}
            />
          </div>
        ))}
      </div>
    </>
  )
}
