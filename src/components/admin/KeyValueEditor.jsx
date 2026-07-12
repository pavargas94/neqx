const CIRUGIA_KEYS = [
  { key: 'colelap', label: 'Colecistectomía' },
  { key: 'histerectomia', label: 'Histerectomía' },
  { key: 'reemplazo', label: 'Reemplazo de rodilla' },
]

export default function KeyValueEditor({ title, description, data, onChange, placeholders = {} }) {
  function updateField(key, value) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>{title}</h3>
        {description && <p className="admin-editor-desc">{description}</p>}
      </div>

      <div className="admin-key-value">
        {CIRUGIA_KEYS.map(({ key, label }) => (
          <div key={key} className="campo">
            <label>{label}</label>
            <input
              type="text"
              value={data[key] || ''}
              placeholder={placeholders[key] || ''}
              onChange={e => updateField(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
