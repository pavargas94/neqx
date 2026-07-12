function emptyOpcionSelectItem() {
  return { value: '', label: '', texto: '' }
}

function emptyOpcion() {
  return {
    id: '',
    label: '',
    tipo: 'select',
    grupo: '',
    orden: 0,
    default: '',
    placeholder: '',
    opciones: [emptyOpcionSelectItem()],
  }
}

function OpcionSelectItemsEditor({ items, onChange }) {
  function updateItem(idx, item) {
    onChange(items.map((current, i) => (i === idx ? item : current)))
  }

  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function addItem() {
    onChange([...items, emptyOpcionSelectItem()])
  }

  return (
    <div className="admin-opcion-items">
      {items.map((item, idx) => (
        <div key={idx} className="admin-list-row" style={{ marginBottom: '6px' }}>
          <input
            type="text"
            value={item.value}
            placeholder="value (ej: inguinal)"
            style={{ width: '120px' }}
            onChange={e => updateItem(idx, { ...item, value: e.target.value })}
          />
          <input
            type="text"
            value={item.label}
            placeholder="Etiqueta (ej: Hernia Inguinal)"
            onChange={e => updateItem(idx, { ...item, label: e.target.value })}
          />
          <input
            type="text"
            value={item.texto}
            placeholder="Texto en nota (opcional)"
            onChange={e => updateItem(idx, { ...item, texto: e.target.value })}
          />
          <button type="button" className="btn-admin-remove" onClick={() => removeItem(idx)}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn-admin-add" onClick={addItem}>
        + Opción del menú
      </button>
    </div>
  )
}

function OpcionRow({ opcion, onChange, onRemove }) {
  function updateField(field, value) {
    onChange({ ...opcion, [field]: value })
  }

  return (
    <div className="admin-opcion-card">
      <div className="admin-procedimiento-grid">
        <div className="campo">
          <label>ID variable</label>
          <input
            type="text"
            value={opcion.id}
            placeholder="ej: tipoHernia"
            onChange={e => updateField('id', e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Etiqueta del formulario</label>
          <input
            type="text"
            value={opcion.label}
            placeholder="ej: Tipo de hernia"
            onChange={e => updateField('label', e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Tipo de campo</label>
          <select value={opcion.tipo} onChange={e => updateField('tipo', e.target.value)}>
            <option value="select">Menú desplegable</option>
            <option value="text">Texto libre</option>
          </select>
        </div>
        <div className="campo">
          <label>Grupo / sección</label>
          <input
            type="text"
            value={opcion.grupo}
            placeholder="ej: Especificaciones de la Hernia"
            onChange={e => updateField('grupo', e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Valor por defecto</label>
          <input
            type="text"
            value={opcion.default}
            onChange={e => updateField('default', e.target.value)}
          />
        </div>
        {opcion.tipo === 'text' && (
          <div className="campo">
            <label>Placeholder</label>
            <input
              type="text"
              value={opcion.placeholder || ''}
              onChange={e => updateField('placeholder', e.target.value)}
            />
          </div>
        )}
      </div>

      {opcion.tipo === 'select' && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Opciones del menú (value / etiqueta / texto en nota)
          </label>
          <OpcionSelectItemsEditor
            items={opcion.opciones || []}
            onChange={items => updateField('opciones', items)}
          />
        </div>
      )}

      <button type="button" className="btn-admin-remove" onClick={onRemove} style={{ marginTop: '10px' }}>
        Eliminar campo
      </button>
    </div>
  )
}

function FlagsEditor({ flags, onChange }) {
  function toggleFlag(key) {
    onChange({ ...flags, [key]: !flags?.[key] })
  }

  function updateDefault(value) {
    onChange({ ...flags, anestesiaDefault: value })
  }

  return (
    <div className="admin-flags-grid">
      <label className="admin-flag-item">
        <input
          type="checkbox"
          checked={Boolean(flags?.segundoCirujano)}
          onChange={() => toggleFlag('segundoCirujano')}
        />
        Mostrar segundo cirujano
      </label>
      <label className="admin-flag-item">
        <input
          type="checkbox"
          checked={Boolean(flags?.bloqueoRegional)}
          onChange={() => toggleFlag('bloqueoRegional')}
        />
        Permitir bloqueo regional
      </label>
      <label className="admin-flag-item">
        <input
          type="checkbox"
          checked={Boolean(flags?.seccionGinecologia)}
          onChange={() => toggleFlag('seccionGinecologia')}
        />
        Sección ginecológica
      </label>
      <label className="admin-flag-item">
        <input
          type="checkbox"
          checked={Boolean(flags?.anestesiaFija)}
          onChange={() => toggleFlag('anestesiaFija')}
        />
        Anestesia fija (sin conmutar)
      </label>
      <div className="campo">
        <label>Anestesia por defecto</label>
        <select
          value={flags?.anestesiaDefault || 'raquidea'}
          onChange={e => updateDefault(e.target.value)}
        >
          <option value="raquidea">Raquídea</option>
          <option value="general">General</option>
        </select>
      </div>
      <div className="campo">
        <label>Variante plantilla anestesia</label>
        <select
          value={flags?.varianteAnestesia || ''}
          onChange={e => onChange({ ...flags, varianteAnestesia: e.target.value || undefined })}
        >
          <option value="">Genérica</option>
          <option value="reemplazo">Reemplazo articular</option>
        </select>
      </div>
    </div>
  )
}

export default function ProcedimientoOpcionesEditor({ proc, onChange }) {
  const opciones = proc.opciones || []
  const flags = proc.flags || {}

  function updateOpcion(idx, opcion) {
    const next = [...opciones]
    next[idx] = opcion
    onChange({ ...proc, opciones: next })
  }

  function removeOpcion(idx) {
    onChange({ ...proc, opciones: opciones.filter((_, i) => i !== idx) })
  }

  function addOpcion() {
    onChange({ ...proc, opciones: [...opciones, emptyOpcion()] })
  }

  return (
    <div className="admin-opciones-editor">
      <p className="admin-editor-desc">
        Campos adicionales del formulario para este procedimiento. Usa el ID como variable en plantillas:
        <code>{' {{id}} '}</code> o <code>{' {{idTexto}} '}</code> para el texto narrativo de selects.
      </p>

      {opciones.map((opcion, idx) => (
        <OpcionRow
          key={idx}
          opcion={opcion}
          onChange={value => updateOpcion(idx, value)}
          onRemove={() => removeOpcion(idx)}
        />
      ))}

      <button type="button" className="btn-admin-add" onClick={addOpcion} style={{ marginBottom: '16px' }}>
        + Campo adicional
      </button>

      <h4 style={{ margin: '0 0 10px', fontSize: '13px' }}>Comportamiento del procedimiento</h4>
      <FlagsEditor
        flags={flags}
        onChange={value => onChange({ ...proc, flags: value })}
      />
    </div>
  )
}
