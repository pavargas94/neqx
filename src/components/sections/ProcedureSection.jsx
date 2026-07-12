import { useSelector, useDispatch } from 'react-redux'
import { setCirugia, setField } from '../../store/formSlice'

export default function ProcedureSection() {
  const dispatch = useDispatch()
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const sala = useSelector(s => s.form.sala)
  const tipoReemplazo = useSelector(s => s.form.tipoReemplazo)
  const lateralidadRodilla = useSelector(s => s.form.lateralidadRodilla)
  const casaMedica = useSelector(s => s.form.casaMedica)

  return (
    <>
      <h3>Procedimiento Principal</h3>
      <div className="fila">
        <div className="campo">
          <label>Seleccione la Cirugía:</label>
          <select value={tipoCirugia} onChange={e => dispatch(setCirugia(e.target.value))}>
            <option value="colelap">Colecistectomía Laparoscópica</option>
            <option value="histerectomia">Histerectomía Abdominal (Laparotomía)</option>
            <option value="reemplazo">Reemplazo de Rodilla</option>
          </select>
        </div>
        <div className="campo">
          <label>Sala Quirúrgica:</label>
          <select value={sala} onChange={e => dispatch(setField({ field: 'sala', value: e.target.value }))}>
            {['1', '2', '3', '4', '5'].map(n => (
              <option key={n} value={n}>Sala {n}</option>
            ))}
          </select>
        </div>
      </div>

      {tipoCirugia === 'reemplazo' && (
        <div>
          <h3>Especificaciones del Reemplazo Articular</h3>
          <div className="fila">
            <div className="campo">
              <label>Clasificación del Procedimiento:</label>
              <select value={tipoReemplazo} onChange={e => dispatch(setField({ field: 'tipoReemplazo', value: e.target.value }))}>
                <option value="primario">Reemplazo Total Primario de Rodilla</option>
                <option value="revision">Revisión Protésica de Rodilla</option>
              </select>
            </div>
            <div className="campo">
              <label>Lateralidad Anatómica:</label>
              <select value={lateralidadRodilla} onChange={e => dispatch(setField({ field: 'lateralidadRodilla', value: e.target.value }))}>
                <option value="derecha">Derecha</option>
                <option value="izquierda">Izquierda</option>
              </select>
            </div>
            <div className="campo">
              <label>Nombre de la Casa Médica Comercial:</label>
              <input
                type="text"
                value={casaMedica}
                placeholder="Ej: Stryker, Zimmer Biomet..."
                onChange={e => dispatch(setField({ field: 'casaMedica', value: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
