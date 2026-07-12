import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'

export default function GynecologySection() {
  const dispatch = useDispatch()
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const sondaFoley = useSelector(s => s.form.sondaFoley)
  const caracteristicaOrina = useSelector(s => s.form.caracteristicaOrina)

  if (tipoCirugia !== 'histerectomia') return null

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  return (
    <div style={{ marginTop: 5, marginBottom: 15 }}>
      <h3>Dispositivos Específicos (Ginecología)</h3>
      <div className="fila">
        <div className="campo">
          <label>Sonda Vesical Foley:</label>
          <select value={sondaFoley} onChange={field('sondaFoley')}>
            {['12 Fr', '14 Fr', '16 Fr', '18 Fr', '20 Fr'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Característica de la Orina:</label>
          <select value={caracteristicaOrina} onChange={field('caracteristicaOrina')}>
            <option value="clara">Clara</option>
            <option value="colúrica">Colúrica</option>
            <option value="hematúrica">Hematúrica</option>
          </select>
        </div>
      </div>
    </div>
  )
}
