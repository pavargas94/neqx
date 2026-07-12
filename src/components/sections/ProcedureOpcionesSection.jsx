import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOpcionProcedimiento } from '../../store/formSlice'
import { getProcedimientoConfig, groupOpciones, resolveOpcionDefaultValue } from '../../utils/procedimientoOpciones'

function CampoOpcion({ opt, value, onChange }) {
  const resolvedValue = value || resolveOpcionDefaultValue(opt)

  if (opt.tipo === 'text') {
    return (
      <div className="campo">
        <label>{opt.label}</label>
        <input
          type="text"
          value={value}
          placeholder={opt.placeholder || ''}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="campo">
      <label>{opt.label}</label>
      <select value={resolvedValue} onChange={e => onChange(e.target.value)}>
        {(opt.opciones || []).map(item => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function ProcedureOpcionesSection() {
  const dispatch = useDispatch()
  const tipoCirugia = useSelector(s => s.form.tipoCirugia)
  const opcionesProcedimiento = useSelector(s => s.form.opcionesProcedimiento)
  const especialidades = useSelector(s => s.constants.data.especialidades) || []

  const procConfig = useMemo(
    () => getProcedimientoConfig(especialidades, tipoCirugia),
    [especialidades, tipoCirugia],
  )

  const grupos = useMemo(
    () => groupOpciones(procConfig.opciones),
    [procConfig.opciones],
  )

  if (!procConfig.opciones?.length) return null

  return (
    <>
      {grupos.map(([grupo, opciones]) => (
        <div key={grupo || 'default'}>
          {grupo && <h3>{grupo}</h3>}
          <div className="fila">
            {opciones.map(opt => (
              <CampoOpcion
                key={opt.id}
                opt={opt}
                value={opcionesProcedimiento[opt.id] ?? resolveOpcionDefaultValue(opt)}
                onChange={value => dispatch(setOpcionProcedimiento({ id: opt.id, value }))}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
