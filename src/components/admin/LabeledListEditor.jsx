export default function LabeledListEditor({
  title,
  description,
  items,
  onChange,
  showSpan2 = false,
}) {
  function updateItem(index, field, value) {
    const next = items.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'label' && !item.value) {
        updated.value = value
      }
      return updated
    })
    onChange(next)
  }

  function toggleSpan2(index) {
    const next = items.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item }
      if (updated.span2) delete updated.span2
      else updated.span2 = true
      return updated
    })
    onChange(next)
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addItem() {
    onChange([...items, { value: '', label: '' }])
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>{title}</h3>
        {description && <p className="admin-editor-desc">{description}</p>}
      </div>

      <div className="admin-labeled-list">
        {items.map((item, index) => (
          <div key={index} className="admin-labeled-row">
            <div className="admin-labeled-fields">
              <div className="campo">
                <label>Valor (nota)</label>
                <input
                  type="text"
                  value={item.value}
                  onChange={e => updateItem(index, 'value', e.target.value)}
                />
              </div>
              <div className="campo">
                <label>Etiqueta (formulario)</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={e => updateItem(index, 'label', e.target.value)}
                />
              </div>
              {showSpan2 && (
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(item.span2)}
                    onChange={() => toggleSpan2(index)}
                  />
                  Ocupa 2 columnas
                </label>
              )}
            </div>
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
