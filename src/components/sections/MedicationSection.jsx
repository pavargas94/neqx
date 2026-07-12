import { useSelector, useDispatch } from 'react-redux'
import { setField, toggleMedicamento } from '../../store/formSlice'
import { MEDICAMENTOS_LISTA } from '../../data/constants'

export default function MedicationSection() {
  const dispatch = useDispatch()
  const medicamentos = useSelector(s => s.form.medicamentos)
  const chkMorfina = useSelector(s => s.form.chkMorfina)
  const dosMorfina = useSelector(s => s.form.dosMorfina)
  const chkHidromorfona = useSelector(s => s.form.chkHidromorfona)
  const dosHidromorfona = useSelector(s => s.form.dosHidromorfona)
  const chkKetamina = useSelector(s => s.form.chkKetamina)
  const dosKetamina = useSelector(s => s.form.dosKetamina)
  const medsAdicional = useSelector(s => s.form.medsAdicional)

  const field = f => e => dispatch(setField({ field: f, value: e.target.value }))
  const fieldBool = f => e => dispatch(setField({ field: f, value: e.target.checked }))

  return (
    <>
      <h3>Medicamentos / Analgesia en Sala</h3>
      <div className="contenedor-meds">
        <div className="grid-meds">
          {MEDICAMENTOS_LISTA.map(med => (
            <label
              key={med.value}
              className="opcion-med"
              style={med.span2 ? { gridColumn: 'span 2' } : {}}
            >
              <input
                type="checkbox"
                checked={medicamentos.includes(med.value)}
                onChange={() => dispatch(toggleMedicamento(med.value))}
              />
              {med.label}
            </label>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <label className="opcion-med" style={{ margin: 0 }}>
              <input type="checkbox" checked={chkMorfina} onChange={fieldBool('chkMorfina')} />
              Morfina
            </label>
            <input
              type="text"
              value={dosMorfina}
              placeholder="ej: 2"
              className="input-dosis"
              onChange={field('dosMorfina')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <label className="opcion-med" style={{ margin: 0 }}>
              <input type="checkbox" checked={chkHidromorfona} onChange={fieldBool('chkHidromorfona')} />
              Hidromorfona
            </label>
            <input
              type="text"
              value={dosHidromorfona}
              placeholder="ej: 0.4"
              className="input-dosis"
              onChange={field('dosHidromorfona')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <label className="opcion-med" style={{ margin: 0 }}>
              <input type="checkbox" checked={chkKetamina} onChange={fieldBool('chkKetamina')} />
              Ketamina
            </label>
            <input
              type="text"
              value={dosKetamina}
              placeholder="ej: 10"
              className="input-dosis"
              onChange={field('dosKetamina')}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 'bold', color: '#616161' }}>
            Adicional/Manual (Si falta alguno):
          </label>
          <input
            type="text"
            value={medsAdicional}
            placeholder="Ej: Ranitidina 50mg EV"
            onChange={field('medsAdicional')}
          />
        </div>
      </div>
    </>
  )
}
