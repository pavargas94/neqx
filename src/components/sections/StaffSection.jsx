import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setField } from '../../store/formSlice'
import { getProcedimientoConfig } from '../../utils/procedimientoOpciones'
import { getCirujanosLista } from '../../utils/cirujanosHelpers'

export default function StaffSection() {
  const dispatch = useDispatch()
  const especialidadId = useSelector(s => s.form.especialidadId)
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const cirujano = useSelector(s => s.form.cirujano)
  const ayudante = useSelector(s => s.form.ayudante)
  const segundoCirujano = useSelector(s => s.form.segundoCirujano)
  const anestesiologo = useSelector(s => s.form.anestesiologo)
  const instrumentador = useSelector(s => s.form.instrumentador)
  const constants = useSelector(s => s.constants.data)
  const especialidades = constants.especialidades || []
  const {
    ayudantes,
    segundosCirujanos,
    anestesiologos,
    instrumentadores,
    labelCirujano,
  } = constants

  const procConfig = useMemo(
    () => getProcedimientoConfig(especialidades, tipoCirugia),
    [especialidades, tipoCirugia],
  )

  const listaCirujanos = useMemo(
    () => getCirujanosLista(constants, especialidadId, tipoCirugia),
    [constants, especialidadId, tipoCirugia],
  )

  useEffect(() => {
    if (!listaCirujanos.length) return
    if (!listaCirujanos.includes(cirujano)) {
      dispatch(setField({ field: 'cirujano', value: listaCirujanos[0] }))
    }
  }, [listaCirujanos, cirujano, dispatch])

  useEffect(() => {
    if (!procConfig.flags?.segundoCirujano) return
    if (!segundosCirujanos.length) return
    if (!segundosCirujanos.includes(segundoCirujano)) {
      dispatch(setField({ field: 'segundoCirujano', value: segundosCirujanos[0] }))
    }
  }, [procConfig.flags?.segundoCirujano, segundosCirujanos, segundoCirujano, dispatch])

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))

  return (
    <>
      <h3>Personal en Sala</h3>
      <div className="fila">
        <div className="campo">
          <label>{labelCirujano[tipoCirugia] || 'Cirujano:'}</label>
          <select value={cirujano} onChange={field('cirujano')}>
            {listaCirujanos.map(doc => (
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

      {procConfig.flags?.segundoCirujano && (
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
