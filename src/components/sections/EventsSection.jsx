import { useSelector, useDispatch } from 'react-redux'
import { addNovedad, updateNovedad } from '../../store/formSlice'
import { formatearEntradaHora, soloNumerosYColon } from '../../utils/timeUtils'

function FilaNovedad({ index }) {
  const dispatch = useDispatch()
  const novedad = useSelector(s => s.form.novedades[index])
  const esFirst = index === 0

  function handleHoraChange(e) {
    dispatch(updateNovedad({ index, field: 'hora', value: soloNumerosYColon(e.target.value) }))
  }

  function handleHoraBlur(e) {
    const r = formatearEntradaHora(e.target.value)
    if (r === null) {
      alert('Hora inválida. Rango militar: 00:00 a 23:59')
      dispatch(updateNovedad({ index, field: 'hora', value: '' }))
    } else {
      dispatch(updateNovedad({ index, field: 'hora', value: r }))
    }
  }

  return (
    <div className="fila fila-novedad" style={index > 0 ? { marginTop: 10 } : {}}>
      <div className="campo" style={{ flex: 0.25 }}>
        {esFirst && <label>Hora Nov:</label>}
        <input
          type="text"
          className="hora-militar input-h-nov"
          placeholder="HH:MM"
          maxLength={5}
          value={novedad.hora}
          onChange={handleHoraChange}
          onBlur={handleHoraBlur}
        />
      </div>
      <div className="campo" style={{ flex: 0.75 }}>
        {esFirst && <label>Descripción del Evento:</label>}
        <input
          type="text"
          className="input-txt-nov"
          placeholder={index === 0 ? 'Ej: Se evidencia infiltración de acceso venoso...' : 'Describa la otra novedad o incidente...'}
          value={novedad.descripcion}
          onChange={e => dispatch(updateNovedad({ index, field: 'descripcion', value: e.target.value }))}
        />
      </div>
    </div>
  )
}

export default function EventsSection() {
  const dispatch = useDispatch()
  const novedades = useSelector(s => s.form.novedades)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
        <h3 style={{ margin: 0, borderLeft: '3px solid #616161', paddingLeft: 8 }}>
          Novedades / Eventos Intraoperatorios
        </h3>
        <button type="button" className="btn-agregar-novedad" onClick={() => dispatch(addNovedad())}>
          + agregar otra
        </button>
      </div>
      <div>
        {novedades.map((_, i) => (
          <FilaNovedad key={i} index={i} />
        ))}
      </div>
    </>
  )
}
