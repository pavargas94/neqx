import StringListEditor from './StringListEditor'

const CIRUGIA_TABS = [
  { key: 'colelap', label: 'Colecistectomía' },
  { key: 'histerectomia', label: 'Histerectomía' },
  { key: 'reemplazo', label: 'Reemplazo de rodilla' },
]

export default function CirujanosEditor({ data, onChange }) {
  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>Cirujanos por tipo de cirugía</h3>
        <p className="admin-editor-desc">
          Listas independientes según el procedimiento seleccionado en el formulario.
        </p>
      </div>

      {CIRUGIA_TABS.map(tab => (
        <div key={tab.key} className="admin-subsection">
          <h4>{tab.label}</h4>
          <StringListEditor
            title=""
            items={data[tab.key] || []}
            placeholder="Nombre del cirujano"
            onChange={items => onChange({ ...data, [tab.key]: items })}
          />
        </div>
      ))}
    </div>
  )
}
