import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { especialidadesService } from '../../services/especialidadesService'
import { fetchFormConstants } from '../../store/constantsSlice'
import ProcedimientoOpcionesEditor from '../../components/admin/ProcedimientoOpcionesEditor'

function slugifyId(text) {
  return (text || '').trim().toLowerCase().replace(/\s+/g, '_')
}

function emptyProcedimiento() {
  return {
    key: '',
    nombre: '',
    labelCirujano: '',
    muestraDefault: '',
    activo: true,
    opciones: [],
    flags: {},
  }
}

function normalizeProcedimientoPayload(p) {
  return {
    key: p.key?.trim() || '',
    nombre: p.nombre?.trim() || '',
    labelCirujano: p.labelCirujano?.trim() || '',
    muestraDefault: p.muestraDefault?.trim() || '',
    activo: p.activo !== false,
    opciones: (p.opciones || []).map(o => ({
      id: o.id?.trim() || '',
      label: o.label?.trim() || '',
      tipo: o.tipo || 'select',
      grupo: o.grupo?.trim() || '',
      orden: o.orden ?? 0,
      default: o.default ?? '',
      placeholder: o.placeholder?.trim() || '',
      opciones: (o.opciones || []).map(item => ({
        value: item.value?.trim() || '',
        label: item.label?.trim() || '',
        texto: item.texto?.trim() || '',
      })).filter(item => item.value && item.label),
    })).filter(o => o.id && o.label),
    flags: p.flags || {},
  }
}

function emptyEspecialidad(orden) {
  return {
    id: '',
    nombre: '',
    descripcion: '',
    rolNombre: '',
    orden,
    procedimientos: [],
    _isNew: true,
  }
}

function ProcedimientoRow({ proc, onChange, onRemove }) {
  const [showOpciones, setShowOpciones] = useState(false)

  return (
    <div className="admin-procedimiento-block">
      <div className="admin-list-row" style={{ alignItems: 'flex-start', gap: '8px' }}>
        <div className="admin-procedimiento-grid">
          <div className="campo">
            <label>Key (ID)</label>
            <input
              type="text"
              value={proc.key}
              placeholder="ej: colelap"
              onChange={e => onChange({ ...proc, key: e.target.value })}
            />
          </div>
          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              value={proc.nombre}
              placeholder="ej: Colecistectomía laparoscópica"
              onChange={e => onChange({ ...proc, nombre: e.target.value })}
            />
          </div>
          <div className="campo">
            <label>Label cirujano</label>
            <input
              type="text"
              value={proc.labelCirujano}
              placeholder="ej: Cirujano Principal:"
              onChange={e => onChange({ ...proc, labelCirujano: e.target.value })}
            />
          </div>
          <div className="campo">
            <label>Muestra por defecto</label>
            <input
              type="text"
              value={proc.muestraDefault}
              placeholder="ej: vesícula biliar"
              onChange={e => onChange({ ...proc, muestraDefault: e.target.value })}
            />
          </div>
        </div>
        <button type="button" className="btn-admin-remove" onClick={onRemove} style={{ marginTop: '22px' }}>
          Eliminar
        </button>
      </div>

      <button
        type="button"
        className="btn-admin-secondary"
        style={{ marginTop: '8px', fontSize: '12px' }}
        onClick={() => setShowOpciones(prev => !prev)}
      >
        {showOpciones ? 'Ocultar campos adicionales' : 'Configurar campos adicionales'}
      </button>

      {showOpciones && (
        <div style={{ marginTop: '12px' }}>
          <ProcedimientoOpcionesEditor proc={proc} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

function EspecialidadCard({ esp, onChange, onSave, onDelete, onCancelNew, saving, saved }) {
  const isNew = Boolean(esp._isNew)

  function updateField(field, value) {
    onChange({ ...esp, [field]: value })
  }

  function updateProc(idx, proc) {
    const next = [...esp.procedimientos]
    next[idx] = proc
    onChange({ ...esp, procedimientos: next })
  }

  function removeProc(idx) {
    onChange({ ...esp, procedimientos: esp.procedimientos.filter((_, i) => i !== idx) })
  }

  function addProc() {
    onChange({
      ...esp,
      procedimientos: [...esp.procedimientos, emptyProcedimiento()],
    })
  }

  return (
    <div className={`admin-editor${isNew ? ' admin-editor-new' : ''}`} style={{ marginBottom: '24px' }}>
      <div className="admin-editor-header">
        {isNew && (
          <p className="admin-editor-desc" style={{ marginBottom: '12px' }}>
            Completa todos los campos de la nueva especialidad y sus procedimientos antes de guardar.
          </p>
        )}
        <div className="admin-especialidad-fields">
          {isNew && (
            <div className="campo">
              <label>ID (slug sin espacios)</label>
              <input
                type="text"
                value={esp.id}
                placeholder="ej: neurologia"
                onChange={e => updateField('id', slugifyId(e.target.value))}
              />
            </div>
          )}
          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              value={esp.nombre}
              placeholder="ej: Cirugía General"
              onChange={e => updateField('nombre', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Rol asociado</label>
            <input
              type="text"
              value={esp.rolNombre}
              placeholder="ej: Cirujano General"
              onChange={e => updateField('rolNombre', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Descripción</label>
            <input
              type="text"
              value={esp.descripcion}
              placeholder="Descripción breve"
              onChange={e => updateField('descripcion', e.target.value)}
            />
          </div>
          <div className="campo admin-campo-orden">
            <label>Orden</label>
            <input
              type="number"
              value={esp.orden}
              min={1}
              onChange={e => updateField('orden', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      <div className="admin-subsection" style={{ marginTop: '12px' }}>
        <h4 style={{ marginBottom: '8px' }}>Procedimientos</h4>
        {esp.procedimientos.length === 0 ? (
          <p className="admin-editor-desc">Sin procedimientos. Agrega uno si aplica.</p>
        ) : (
          esp.procedimientos.map((proc, idx) => (
            <ProcedimientoRow
              key={idx}
              proc={proc}
              onChange={proc => updateProc(idx, proc)}
              onRemove={() => removeProc(idx)}
            />
          ))
        )}
        <button type="button" className="btn-admin-add" onClick={addProc}>
          + Agregar procedimiento
        </button>
      </div>

      <div className="admin-actions" style={{ marginTop: '16px' }}>
        {saved && <p className="admin-success">Guardado en Firestore.</p>}
        <div className="admin-actions-buttons">
          {isNew ? (
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onCancelNew}
              disabled={saving}
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onDelete}
              disabled={saving}
            >
              Eliminar especialidad
            </button>
          )}
          <button
            type="button"
            className="btn-admin-save"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Guardando…' : isNew ? 'Crear especialidad' : 'Guardar especialidad'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminEspecialidadesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    especialidadesService.fetchAll()
      .then(data => { setEspecialidades(data); setLoading(false) })
      .catch(e => { setFetchError(e.message); setLoading(false) })
  }, [])

  function updateEsp(idx, esp) {
    setEspecialidades(prev => prev.map((e, i) => (i === idx ? esp : e)))
  }

  function validateEspecialidad(esp) {
    const id = slugifyId(esp.id)
    if (!id) return 'El ID de la especialidad es obligatorio.'
    if (!esp.nombre?.trim()) return 'El nombre de la especialidad es obligatorio.'
    if (!esp.rolNombre?.trim()) return 'El rol asociado es obligatorio.'
    return null
  }

  async function handleSave(idx) {
    const esp = especialidades[idx]
    if (!esp) return

    const error = validateEspecialidad(esp)
    if (error) {
      setActionError(error)
      return
    }

    const id = slugifyId(esp.id)
    if (esp._isNew && especialidades.some((e, i) => i !== idx && e.id === id)) {
      setActionError(`Ya existe una especialidad con el ID "${id}".`)
      return
    }

    setActionError(null)
    setSavingId(id)
    try {
      const payload = {
        ...esp,
        id,
        nombre: esp.nombre.trim(),
        descripcion: esp.descripcion?.trim() || '',
        rolNombre: esp.rolNombre.trim(),
        procedimientos: (esp.procedimientos || [])
          .map(normalizeProcedimientoPayload)
          .filter(p => p.key && p.nombre),
      }
      delete payload._isNew

      await especialidadesService.save(id, payload)

      setEspecialidades(prev => prev.map((e, i) => (i === idx ? { ...payload } : e)))
      await dispatch(fetchFormConstants())
      setSavedId(id)
      setTimeout(() => setSavedId(null), 3000)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(esp) {
    if (!window.confirm(`¿Eliminar la especialidad "${esp.nombre}"? Esta acción no se puede deshacer.`)) return
    setActionError(null)
    try {
      await especialidadesService.delete(esp.id)
      setEspecialidades(prev => prev.filter(e => e.id !== esp.id))
    } catch (e) {
      setActionError(e.message)
    }
  }

  function handleAddNew() {
    if (especialidades.some(e => e._isNew)) {
      setActionError('Completa o cancela la especialidad nueva antes de agregar otra.')
      return
    }
    setActionError(null)
    setEspecialidades(prev => [...prev, emptyEspecialidad(prev.length + 1)])
  }

  function handleCancelNew(idx) {
    setEspecialidades(prev => prev.filter((_, i) => i !== idx))
    setActionError(null)
  }

  const hasDraft = especialidades.some(e => e._isNew)

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Especialidades médicas</h2>
          <p>
            Gestiona especialidades y sus procedimientos. Al crear una nueva,
            completa todos los datos en un solo formulario.
          </p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      {fetchError && <p className="admin-error">Error al cargar: {fetchError}</p>}
      {actionError && <p className="admin-error">{actionError}</p>}

      {loading ? (
        <p style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando especialidades…</p>
      ) : (
        <>
          {especialidades.map((esp, idx) => (
            <EspecialidadCard
              key={esp._isNew ? 'new-draft' : esp.id}
              esp={esp}
              onChange={updated => updateEsp(idx, updated)}
              onSave={() => handleSave(idx)}
              onDelete={() => handleDelete(esp)}
              onCancelNew={() => handleCancelNew(idx)}
              saving={savingId === esp.id || (esp._isNew && savingId === slugifyId(esp.id))}
              saved={savedId === esp.id}
            />
          ))}

          {!hasDraft && (
            <button
              type="button"
              className="btn-admin-add"
              onClick={handleAddNew}
            >
              + Nueva especialidad
            </button>
          )}
        </>
      )}
    </div>
  )
}
