import { useEffect, useRef, useState } from 'react'
import { CATEGORIAS_ORTOPEDIA } from '../../utils/personalModel'

function CirujanoRow({ member, index, especialidades, onChange, onRemove, autoFocus }) {
  const nombreRef = useRef(null)

  useEffect(() => {
    if (autoFocus && nombreRef.current) {
      nombreRef.current.focus()
      nombreRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [autoFocus])

  function update(patch) {
    onChange(index, { ...member, ...patch })
  }

  function handleEspecialidadChange(especialidadId) {
    const esp = especialidades.find(e => e.id === especialidadId)
    update({
      especialidadId,
      rol: esp?.rolNombre || esp?.nombre || '',
      categorias: especialidadId === 'ortopedia' ? (member.categorias || []) : [],
    })
  }

  function toggleCategoria(categoria) {
    const current = member.categorias || []
    const next = current.includes(categoria)
      ? current.filter(c => c !== categoria)
      : [...current, categoria]
    update({ categorias: next })
  }

  return (
    <div className="admin-personal-card">
      <div className="admin-personal-grid">
        <div className="campo">
          <label>Nombre</label>
          <input
            ref={nombreRef}
            type="text"
            value={member.nombre}
            placeholder="Dr. Juan Pérez"
            onChange={e => update({ nombre: e.target.value })}
          />
        </div>
        <div className="campo">
          <label>Especialidad</label>
          <select
            value={member.especialidadId || ''}
            onChange={e => handleEspecialidadChange(e.target.value)}
          >
            {especialidades.length === 0 ? (
              <option value="">Cargando especialidades…</option>
            ) : (
              especialidades.map(esp => (
                <option key={esp.id} value={esp.id}>{esp.nombre}</option>
              ))
            )}
          </select>
        </div>
        <div className="campo">
          <label>Rol</label>
          <input
            type="text"
            value={member.rol || ''}
            placeholder="Ej: Ortopedista"
            onChange={e => update({ rol: e.target.value })}
          />
        </div>
      </div>

      {member.especialidadId === 'ortopedia' && (
        <div className="admin-personal-categorias">
          <span className="admin-personal-categorias-label">
            Categorías (requerido para aparecer en el formulario)
          </span>
          {CATEGORIAS_ORTOPEDIA.map(cat => (
            <label key={cat} className="admin-checkbox">
              <input
                type="checkbox"
                checked={(member.categorias || []).includes(cat)}
                onChange={() => toggleCategoria(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      )}

      <div className="admin-personal-actions">
        <button type="button" className="btn-admin-remove" onClick={() => onRemove(index)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}

function EspecialidadSection({
  esp,
  items,
  especialidades,
  onChange,
  onRemove,
  onAdd,
  focusIndex,
  collapsed,
  onToggle,
}) {
  const count = items.length

  return (
    <section className={`admin-especialidad${collapsed ? ' admin-especialidad-collapsed' : ''}`}>
      <button
        type="button"
        className="admin-especialidad-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
      >
        <span className="admin-especialidad-chevron" aria-hidden="true">▼</span>
        <span className="admin-especialidad-title">
          <strong>{esp.nombre}</strong>
          <span className="admin-especialidad-count">
            {count} {count === 1 ? 'cirujano' : 'cirujanos'}
          </span>
        </span>
      </button>

      {!collapsed && (
        <div className="admin-especialidad-body">
          {esp.descripcion && <p className="admin-editor-desc">{esp.descripcion}</p>}
          {esp.rolNombre && esp.rolNombre !== esp.nombre && (
            <p className="admin-editor-desc">Rol: {esp.rolNombre}</p>
          )}

          {items.length === 0 ? (
            <p className="admin-editor-desc admin-especialidad-empty">
              Sin cirujanos en esta especialidad.
            </p>
          ) : (
            items.map(({ member, index }) => (
              <CirujanoRow
                key={member.id || member._clientId || `row-${index}`}
                member={member}
                index={index}
                especialidades={especialidades}
                onChange={onChange}
                onRemove={onRemove}
                autoFocus={focusIndex === index}
              />
            ))
          )}

          <button
            type="button"
            className="btn-admin-add btn-admin-add-section"
            onClick={() => onAdd(esp.id)}
          >
            + Agregar cirujano en {esp.nombre}
          </button>
        </div>
      )}
    </section>
  )
}

export default function CirujanosPersonalEditor({
  members,
  especialidades,
  onChange,
  onAdd,
  focusIndex = null,
}) {
  const [collapsed, setCollapsed] = useState({})
  const [orphanCollapsed, setOrphanCollapsed] = useState(true)

  useEffect(() => {
    if (focusIndex == null) return
    const member = members[focusIndex]
    if (!member) return

    if (member.especialidadId) {
      setCollapsed(prev => ({ ...prev, [member.especialidadId]: false }))
    } else {
      setOrphanCollapsed(false)
    }
  }, [focusIndex, members])

  function isSectionCollapsed(especialidadId) {
    return collapsed[especialidadId] !== false
  }

  function updateMember(index, updated) {
    onChange(members.map((m, i) => (i === index ? updated : m)))
  }

  function removeMember(index) {
    onChange(members.filter((_, i) => i !== index))
  }

  function handleAdd(especialidadId) {
    setCollapsed(prev => ({ ...prev, [especialidadId]: false }))
    onAdd(especialidadId)
  }

  function toggleSection(especialidadId) {
    setCollapsed(prev => ({
      ...prev,
      [especialidadId]: prev[especialidadId] === false,
    }))
  }

  const indexed = members.map((member, index) => ({ member, index }))

  const grouped = especialidades.map(esp => ({
    esp,
    items: indexed.filter(({ member }) => member.especialidadId === esp.id),
  }))

  const sinEspecialidad = indexed.filter(({ member }) => !member.especialidadId)

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>Cirujanos por especialidad</h3>
        <p className="admin-editor-desc">
          Los cirujanos se organizan por especialidad. Haz clic en el encabezado
          de cada sección para expandirla o colapsarla.
        </p>
      </div>

      {especialidades.length === 0 ? (
        <p className="admin-editor-desc">
          No hay especialidades cargadas. Pobla Firestore o revisa la configuración.
        </p>
      ) : (
        grouped.map(({ esp, items }) => (
          <EspecialidadSection
            key={esp.id}
            esp={esp}
            items={items}
            especialidades={especialidades}
            onChange={updateMember}
            onRemove={removeMember}
            onAdd={handleAdd}
            focusIndex={focusIndex}
            collapsed={isSectionCollapsed(esp.id)}
            onToggle={() => toggleSection(esp.id)}
          />
        ))
      )}

      {sinEspecialidad.length > 0 && (
        <section className={`admin-especialidad admin-especialidad-orphan${orphanCollapsed ? ' admin-especialidad-collapsed' : ''}`}>
          <button
            type="button"
            className="admin-especialidad-toggle"
            onClick={() => setOrphanCollapsed(prev => !prev)}
            aria-expanded={!orphanCollapsed}
          >
            <span className="admin-especialidad-chevron" aria-hidden="true">▼</span>
            <span className="admin-especialidad-title">
              <strong>Sin especialidad asignada</strong>
              <span className="admin-especialidad-count">
                {sinEspecialidad.length} pendiente{sinEspecialidad.length === 1 ? '' : 's'}
              </span>
            </span>
          </button>

          {!orphanCollapsed && (
            <div className="admin-especialidad-body">
              <p className="admin-editor-desc">Asigna una especialidad a estos registros.</p>
              {sinEspecialidad.map(({ member, index }) => (
                <CirujanoRow
                  key={member.id || member._clientId || `orphan-${index}`}
                  member={member}
                  index={index}
                  especialidades={especialidades}
                  onChange={updateMember}
                  onRemove={removeMember}
                  autoFocus={focusIndex === index}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
