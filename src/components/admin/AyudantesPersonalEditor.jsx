function AyudanteRow({ member, index, onChange, onRemove }) {
  function update(patch) {
    onChange(index, { ...member, ...patch })
  }

  return (
    <div className="admin-personal-card">
      <div className="admin-personal-grid admin-personal-grid-2">
        <div className="campo">
          <label>Nombre (valor en la nota)</label>
          <input
            type="text"
            value={member.nombre}
            placeholder="Dr. Esteban Ortega"
            onChange={e => update({ nombre: e.target.value })}
          />
        </div>
        <div className="campo">
          <label>Etiqueta (visible en el formulario)</label>
          <input
            type="text"
            value={member.label || ''}
            placeholder="Dr. Esteban Ortega"
            onChange={e => update({ label: e.target.value })}
          />
        </div>
      </div>
      <div className="admin-personal-actions">
        <button type="button" className="btn-admin-remove" onClick={() => onRemove(index)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default function AyudantesPersonalEditor({ members, onChange, onAdd }) {
  function updateMember(index, updated) {
    onChange(members.map((m, i) => (i === index ? updated : m)))
  }

  function removeMember(index) {
    onChange(members.filter((_, i) => i !== index))
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>Médicos ayudantes</h3>
        <p className="admin-editor-desc">
          El nombre se guarda en la nota; la etiqueta es lo que ve el usuario en el select.
          La opción &quot;(No aplica)&quot; se agrega automáticamente en el formulario.
        </p>
      </div>

      {members.map((member, index) => (
        <AyudanteRow
          key={member.id || `new-${index}`}
          member={member}
          index={index}
          onChange={updateMember}
          onRemove={removeMember}
        />
      ))}

      <button type="button" className="btn-admin-add" onClick={onAdd}>
        + Agregar ayudante
      </button>
    </div>
  )
}
