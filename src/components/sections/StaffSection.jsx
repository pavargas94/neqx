import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'

export default function StaffSection() {
  const dispatch = useDispatch()
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const cirujano = useSelector(s => s.form.cirujano)
  const ayudante = useSelector(s => s.form.ayudante)
  const segundoCirujano = useSelector(s => s.form.segundoCirujano)
  const anestesiologo = useSelector(s => s.form.anestesiologo)
  const instrumentador = useSelector(s => s.form.instrumentador)
  const {
    cirujanos,
    ayudantes,
    segundosCirujanos,
    anestesiologos,
    instrumentadores,
    labelCirujano,
  } = useSelector(s => s.constants.data)

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  return (
    <>
      <h3>Personal en Sala</h3>
      <div className="fila">
        <div className="campo">
          <label>{labelCirujano[tipoCirugia]}</label>
          <select value={cirujano} onChange={field('cirujano')}>
            {cirujanos[tipoCirugia].map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Médico Ayudante:</label>
          <select value={ayudante} onChange={field('ayudante')}>
            {ayudantes.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {tipoCirugia === 'reemplazo' && (
        <div className="fila">
          <div className="campo">
            <label>Segundo Cirujano (Ortopedista par):</label>
            <select value={segundoCirujano} onChange={field('segundoCirujano')}>
              {segundosCirujanos.map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>
          <div className="campo" />
        </div>
      )}

      <div className="fila">
        <div className="campo">
          <label>Anestesiólogo:</label>
          <select value={anestesiologo} onChange={field('anestesiologo')}>
            {anestesiologos.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Instrumentador(a):</label>
          <select value={instrumentador} onChange={field('instrumentador')}>
            {instrumentadores.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  )
}
