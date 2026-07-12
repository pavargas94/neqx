export default function StringListEditor({ title, description, items, onChange, placeholder }) {
  function updateItem(index, value) {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addItem() {
    onChange([...items, ''])
  }

  return (
    <div className="admin-editor">
      {title && (
        <div className="admin-editor-header">
          <h3>{title}</h3>
          {description && <p className="admin-editor-desc">{description}</p>}
        </div>
      )}

      <div className="admin-list">
        {items.map((item, index) => (
          <div key={index} className="admin-list-row">
            <input
              type="text"
              value={item}
              placeholder={placeholder}
              onChange={e => updateItem(index, e.target.value)}
            />
            <button type="button" className="btn-admin-remove" onClick={() => removeItem(index)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-admin-add" onClick={addItem}>
        + Agregar
      </button>
    </div>
  )
}
