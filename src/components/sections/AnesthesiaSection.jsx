import { useSelector, useDispatch } from 'react-redux'
import {
  setField, conmutarAnestesia, toggleBloqueo, activarFalloAnestesico,
} from '../../store/formSlice'
import { formatearEntradaHora, soloNumerosYColon } from '../../utils/timeUtils'

function HoraBloqueo() {
  const dispatch = useDispatch()
  const hBloqueo = useSelector(s => s.form.hBloqueo)

  function handleChange(e) {
    dispatch(setField({ field: 'hBloqueo', value: soloNumerosYColon(e.target.value) }))
  }
  function handleBlur(e) {
    const r = formatearEntradaHora(e.target.value)
    if (r === null) {
      alert('Hora inválida. Rango militar: 00:00 a 23:59')
      dispatch(setField({ field: 'hBloqueo', value: '' }))
    } else {
      dispatch(setField({ field: 'hBloqueo', value: r }))
    }
  }

  return (
    <input
      type="text"
      className="hora-militar"
      placeholder="HH:MM"
      maxLength={5}
      value={hBloqueo}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

function HoraGeneral() {
  const dispatch = useDispatch()
  const hAnestesiaGeneral = useSelector(s => s.form.hAnestesiaGeneral)

  function handleChange(e) {
    dispatch(setField({ field: 'hAnestesiaGeneral', value: soloNumerosYColon(e.target.value) }))
  }
  function handleBlur(e) {
    const r = formatearEntradaHora(e.target.value)
    if (r === null) {
      alert('Hora inválida. Rango militar: 00:00 a 23:59')
      dispatch(setField({ field: 'hAnestesiaGeneral', value: '' }))
    } else {
      dispatch(setField({ field: 'hAnestesiaGeneral', value: r }))
    }
  }

  return (
    <input
      type="text"
      className="hora-militar"
      placeholder="HH:MM"
      maxLength={5}
      value={hAnestesiaGeneral}
      onChange={handleChange}
      onBlur={handleBlur}
      style={{ borderColor: '#757575' }}
    />
  )
}

export default function AnesthesiaSection() {
  const dispatch = useDispatch()
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const modalidadAnestesia = useSelector(s => s.form.modalidadAnestesia)
  const anestApl = useSelector(s => s.form.anestApl)
  const anestLocal = useSelector(s => s.form.anestLocal)
  const anestAnalgesico = useSelector(s => s.form.anestAnalgesico)
  const mostrarBloqueo = useSelector(s => s.form.mostrarBloqueo)
  const tipoBloqueo = useSelector(s => s.form.tipoBloqueo)
  const lateralidadBloqueo = useSelector(s => s.form.lateralidadBloqueo)
  const volBloqueoLido = useSelector(s => s.form.volBloqueoLido)
  const volBloqueoBupinest = useSelector(s => s.form.volBloqueoBupinest)
  const volBloqueoBupirop = useSelector(s => s.form.volBloqueoBupirop)
  const medsAnestesia = useSelector(s => s.form.medsAnestesia)
  const tubo = useSelector(s => s.form.tubo)
  const gas = useSelector(s => s.form.gas)

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  const mostrarToggle = tipoCirugia !== 'colelap'
  const esRaquidea = modalidadAnestesia === 'raquidea' || modalidadAnestesia === 'fallo_raquidea'
  const esGeneral = modalidadAnestesia === 'general' || modalidadAnestesia === 'fallo_raquidea'
  const esFallo = modalidadAnestesia === 'fallo_raquidea'

  const textoBotonConmutar = (modalidadAnestesia === 'raquidea' || modalidadAnestesia === 'fallo_raquidea')
    ? 'Cambio de anestesia GENERAL'
    : 'Cambio de anestesia RAQUÍDEA'

  return (
    <>
      <div className="header-dinamico-anestesia">
        <h3 style={{ margin: 0, borderLeft: '3px solid #616161', paddingLeft: 8 }}>
          Datos Técnicos Anestesia
        </h3>
        {mostrarToggle && (
          <button
            type="button"
            className="btn-toggle-anestesia"
            onClick={() => dispatch(conmutarAnestesia())}
          >
            {textoBotonConmutar}
          </button>
        )}
      </div>

      {esRaquidea && (
        <div className="subpanel-anestesia">
          <div className="fila">
            <div className="campo">
              <label>Aguja Quirúrgica (APL):</label>
              <select value={anestApl} onChange={field('anestApl')}>
                {['25G', '26G', '27G', '27G Punta de lápiz'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Anestésico Local:</label>
              <select value={anestLocal} onChange={field('anestLocal')}>
                <option value="Bupirop 0.5% Pesada">Bupirop 0.5% Pesada</option>
                <option value="Bupinest 0.75% Pesada">Bupinest 0.75% Pesada</option>
              </select>
            </div>
            <div className="campo">
              <label>Anestésico Analgésico:</label>
              <select value={anestAnalgesico} onChange={field('anestAnalgesico')}>
                <option value="Fentanilo">Fentanilo</option>
                <option value="Morfina">Morfina</option>
                <option value="Fentanilo/Morfina">Fentanilo/Morfina</option>
                <option value="Hidromorfona">Hidromorfona</option>
              </select>
            </div>
          </div>

          {tipoCirugia === 'reemplazo' && (
            <button
              type="button"
              className="btn-toggle-anestesia"
              style={{ marginTop: 10, marginBottom: 5, width: '100%', backgroundColor: '#757575', color: 'white' }}
              onClick={() => dispatch(toggleBloqueo())}
            >
              {mostrarBloqueo ? '❌ Quitar Bloqueo Anestésico' : '➕ Añadir Bloqueo Anestésico Regional'}
            </button>
          )}

          {mostrarBloqueo && (
            <div style={{ backgroundColor: '#e0e0e0', border: '1px solid #bdbdbd', borderRadius: 6, padding: 10, marginTop: 5, marginBottom: 10 }}>
              <div className="fila">
                <div className="campo" style={{ flex: 0.25 }}>
                  <label>Hora Bloqueo:</label>
                  <HoraBloqueo />
                </div>
                <div className="campo" style={{ flex: 0.5 }}>
                  <label>Tipo de Bloqueo:</label>
                  <select value={tipoBloqueo} onChange={field('tipoBloqueo')}>
                    <option value="el canal aductor">Canal aductor</option>
                    <option value="el bloqueo Femoral/Musculocutáneo">Femoral/Musculocutáneo</option>
                    <option value="el bloqueo IPACK">IPACK</option>
                    <option value="el bloqueo ciático poplíteo">Ciático poplíteo</option>
                  </select>
                </div>
                <div className="campo" style={{ flex: 0.25 }}>
                  <label>Lateralidad Bloqueo:</label>
                  <select value={lateralidadBloqueo} onChange={field('lateralidadBloqueo')}>
                    <option value="derecho">Derecho</option>
                    <option value="izquierdo">Izquierdo</option>
                    <option value="bilateral">Bilateral</option>
                  </select>
                </div>
              </div>
              <div className="fila">
                <div className="campo">
                  <label>Vol. Lidocaína 2%:</label>
                  <input type="text" value={volBloqueoLido} placeholder="Ej: 10" onChange={field('volBloqueoLido')} />
                </div>
                <div className="campo">
                  <label>Vol. Bupinest 0.75%:</label>
                  <input type="text" value={volBloqueoBupinest} placeholder="Ej: 15" onChange={field('volBloqueoBupinest')} />
                </div>
                <div className="campo">
                  <label>Vol. Bupirop 0.5%:</label>
                  <input type="text" value={volBloqueoBupirop} placeholder="Ej: 12" onChange={field('volBloqueoBupirop')} />
                </div>
              </div>
            </div>
          )}

          {!esFallo && (
            <button
              type="button"
              className="btn-toggle-anestesia"
              style={{ backgroundColor: '#bdbdbd', color: '#212121', border: '1px solid #757575', marginTop: 8, width: '100%', display: 'block' }}
              onClick={() => dispatch(activarFalloAnestesico())}
            >
              ⚠️ Fallo Anestésico (Conversión a General)
            </button>
          )}
        </div>
      )}

      {esGeneral && (
        <div className="subpanel-anestesia" style={{ marginTop: esRaquidea ? 8 : 0 }}>
          {esFallo && (
            <div className="fila" style={{ backgroundColor: '#e0e0e0', padding: 8, borderRadius: 6, border: '1px dashed #757575' }}>
              <div className="campo">
                <label style={{ color: '#212121', fontWeight: 'bold' }}>
                  Hora de Inducción / Conversión General:
                </label>
                <HoraGeneral />
              </div>
            </div>
          )}
          <div className="fila" style={{ marginTop: 5 }}>
            <div className="campo">
              <label>Fármacos Inducción:</label>
              <input
                type="text"
                value={medsAnestesia}
                onChange={field('medsAnestesia')}
              />
            </div>
          </div>
          <div className="fila">
            <div className="campo">
              <label>Tubo Orotraqueal:</label>
              <select value={tubo} onChange={field('tubo')}>
                {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5'].map(v => (
                  <option key={v} value={v}>N° {v}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Gas de Mantenimiento:</label>
              <select value={gas} onChange={field('gas')}>
                <option value="Sevoflurane">Sevoflurane</option>
                <option value="Desflurane">Desflurane</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
