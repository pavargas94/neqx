import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'

export default function VenousSection() {
  const dispatch = useDispatch()
  const calibre = useSelector(s => s.form.calibre)
  const ubicacionVena = useSelector(s => s.form.ubicacionVena)
  const miembro = useSelector(s => s.form.miembro)

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  return (
    <>
      <h3>Accesos Venosos</h3>
      <div className="fila">
        <div className="campo">
          <label>Calibre Catéter:</label>
          <select value={calibre} onChange={field('calibre')}>
            {['14G', '16G', '18G', '20G', '22G'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Ubicación Anatómica:</label>
          <select value={ubicacionVena} onChange={field('ubicacionVena')}>
            <option value="dorso de la mano">Dorso de la mano</option>
            <option value="antebrazo">Antebrazo</option>
            <option value="flexura del codo">Flexura del codo</option>
          </select>
        </div>
        <div className="campo">
          <label>Miembro:</label>
          <select value={miembro} onChange={field('miembro')}>
            <option value="derecho">Derecho</option>
            <option value="izquierdo">Izquierdo</option>
          </select>
        </div>
      </div>
    </>
  )
}
