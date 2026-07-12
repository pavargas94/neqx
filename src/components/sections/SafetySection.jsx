import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'

export default function SafetySection() {
  const dispatch = useDispatch()
  const placaBisturi = useSelector(s => s.form.placaBisturi)
  const tipoDrenaje = useSelector(s => s.form.tipoDrenaje)
  const muestraPatologia = useSelector(s => s.form.muestraPatologia)
  const nombreMuestra = useSelector(s => s.form.nombreMuestra)

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  return (
    <>
      <h3>Seguridad Biomédica y Dispositivos</h3>
      <div className="fila">
        <div className="campo">
          <label>Ubicación Placa Electrobisturí:</label>
          <select value={placaBisturi} onChange={field('placaBisturi')}>
            <option value="muslo derecho">Muslo Derecho</option>
            <option value="muslo izquierdo">Muslo Izquierdo</option>
            <option value="brazo derecho">Brazo Derecho</option>
            <option value="brazo izquierdo">Brazo Izquierdo</option>
          </select>
        </div>
        <div className="campo">
          <label>Drenajes:</label>
          <select value={tipoDrenaje} onChange={field('tipoDrenaje')}>
            <option value="ninguno">No deja drenajes</option>
            <option value="penrose">Dren de Penrose</option>
            <option value="jackson-pratt">Drenaje de succión cerrado (Jackson-Pratt)</option>
            <option value="hemovac">Drenaje Hemovac</option>
          </select>
        </div>
        <div className="campo">
          <label>Envío de Muestra (Patología):</label>
          <select value={muestraPatologia} onChange={field('muestraPatologia')}>
            <option value="no">No aplica / Sin muestra</option>
            <option value="si">Sí, enviar a Patología</option>
          </select>
        </div>
      </div>

      {muestraPatologia === 'si' && (
        <div className="fila" style={{ marginTop: 5, marginBottom: 5 }}>
          <div className="campo">
            <label style={{ color: '#616161', fontWeight: 'bold' }}>
              Descripción o Nombre de la Muestra:
            </label>
            <input
              type="text"
              value={nombreMuestra}
              placeholder="Ej: Vesícula biliar, Útero total, Fragmentos óseos..."
              onChange={field('nombreMuestra')}
            />
          </div>
        </div>
      )}
    </>
  )
}
