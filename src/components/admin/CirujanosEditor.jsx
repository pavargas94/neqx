import { ESPECIALIDADES } from '../../data/especialidades'
import StringListEditor from './StringListEditor'

export default function CirujanosEditor({ data, onChange }) {
  function updateCirugia(especialidadKey, cirugiaKey, items) {
    onChange({
      ...data,
      [especialidadKey]: {
        ...data[especialidadKey],
        [cirugiaKey]: items,
      },
    })
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>Cirujanos por especialidad</h3>
        <p className="admin-editor-desc">
          Cada especialidad agrupa las listas de cirujanos según el procedimiento.
          Para agregar una nueva especialidad médica, configúrala en el sistema.
        </p>
      </div>

      {ESPECIALIDADES.map(especialidad => (
        <section key={especialidad.key} className="admin-especialidad">
          <div className="admin-especialidad-header">
            <h3>{especialidad.label}</h3>
            {especialidad.description && (
              <p className="admin-editor-desc">{especialidad.description}</p>
            )}
          </div>

          {especialidad.cirugias.map(cirugia => (
            <div key={cirugia.key} className="admin-subsection">
              <h4>{cirugia.label}</h4>
              <StringListEditor
                title=""
                items={data[especialidad.key]?.[cirugia.key] || []}
                placeholder="Nombre del cirujano"
                onChange={items => updateCirugia(especialidad.key, cirugia.key, items)}
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
