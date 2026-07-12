export default function SimplePersonalEditor({
  title,
  description,
  placeholder,
  members,
  onChange,
  onAdd,
}) {
  function updateMember(index, nombre) {
    onChange(members.map((m, i) => (i === index ? { ...m, nombre } : m)))
  }

  function removeMember(index) {
    onChange(members.filter((_, i) => i !== index))
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>{title}</h3>
        {description && <p className="admin-editor-desc">{description}</p>}
      </div>

      <div className="admin-list">
        {members.map((member, index) => (
          <div key={member.id || `new-${index}`} className="admin-list-row">
            <input
              type="text"
              value={member.nombre}
              placeholder={placeholder}
              onChange={e => updateMember(index, e.target.value)}
            />
            <button type="button" className="btn-admin-remove" onClick={() => removeMember(index)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-admin-add" onClick={onAdd}>
        + Agregar
      </button>
    </div>
  )
}
