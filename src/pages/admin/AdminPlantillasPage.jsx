import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plantillasService } from '../../services/plantillasService'
import { DEFAULT_PLANTILLAS } from '../../data/plantillasDefaults'

const PROCEDIMIENTOS = [
  { key: 'colelap', label: 'Colecistectomía laparoscópica' },
  { key: 'histerectomia', label: 'Histerectomía abdominal' },
  { key: 'reemplazo', label: 'Reemplazo articular' },
]

const SECCIONES_LABELS = {
  ingreso: 'Ingreso',
  lavado: 'Lavado quirúrgico',
  inicio: 'Inicio de cirugía',
  medicacion: 'Medicación',
  final: 'Final de cirugía',
  traslado: 'Traslado a recuperación',
}

const ANESTESIA_LABELS = {
  raquidea: 'Raquídea (genérica)',
  general: 'General',
  fallo_raquidea: 'Fallo raquídea → Conversión general',
  raquidea_reemplazo: 'Raquídea (Reemplazo articular)',
  bloqueo: 'Bloqueo regional ecoguiado',
}

const SUFIJO_LABELS = {
  raquidea: 'Sufijo anestesia raquídea',
  general: 'Sufijo anestesia general',
  fallo_raquidea: 'Sufijo anestesia fallo raquídea',
}

// ─── Sección de Procedimiento ─────────────────────────────────────────────────

function SeccionProcedimiento({ data, onChange }) {
  const secciones = data?.secciones ?? {}
  const sufijoAnestesia = data?.sufijoAnestesia ?? {}

  function updateSeccion(key, value) {
    onChange({ ...data, secciones: { ...secciones, [key]: value } })
  }

  function updateSufijo(key, value) {
    onChange({ ...data, sufijoAnestesia: { ...sufijoAnestesia, [key]: value } })
  }

  return (
    <div>
      <div className="admin-editor" style={{ marginBottom: '24px' }}>
        <div className="admin-editor-header">
          <h3>Sufijos de anestesia en traslado</h3>
          <p className="admin-editor-desc">
            Texto que completa "…bajo efectos residuales de anestesia <em>{'{{sufijoAnestesiaRecup}}'}</em>".
          </p>
        </div>
        {Object.entries(SUFIJO_LABELS).map(([key, label]) => (
          <div key={key} className="campo" style={{ marginBottom: '12px' }}>
            <label>{label}</label>
            <input
              type="text"
              value={sufijoAnestesia[key] ?? ''}
              onChange={e => updateSufijo(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="admin-editor">
        <div className="admin-editor-header">
          <h3>Secciones de la nota</h3>
          <p className="admin-editor-desc">
            Usa <code>{'{{variable}}'}</code> para valores dinámicos.
            El primer <code>{'{{hN}}'}</code> de cada sección determina su posición en la nota.
          </p>
        </div>
        {Object.entries(SECCIONES_LABELS).map(([key, label]) => (
          <div key={key} className="campo" style={{ marginBottom: '20px' }}>
            <label>{label}</label>
            <textarea
              value={secciones[key] ?? ''}
              rows={5}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
              onChange={e => updateSeccion(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sección de Anestesia ─────────────────────────────────────────────────────

function SeccionAnestesia({ data, onChange }) {
  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h3>Plantillas de anestesia compartidas</h3>
        <p className="admin-editor-desc">
          Estos bloques se insertan en todas las cirugías según la modalidad de anestesia seleccionada.
        </p>
      </div>
      {Object.entries(ANESTESIA_LABELS).map(([key, label]) => (
        <div key={key} className="campo" style={{ marginBottom: '20px' }}>
          <label>{label}</label>
          <textarea
            value={data?.[key] ?? ''}
            rows={5}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
            onChange={e => onChange({ ...data, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Sección de Configuración ─────────────────────────────────────────────────

function SeccionConfig({ data, onChange }) {
  const textosDrenaje = data?.textosDrenaje ?? {}
  const camposValidacion = data?.camposValidacion ?? []

  function updateDrenaje(key, value) {
    onChange({ ...data, textosDrenaje: { ...textosDrenaje, [key]: value } })
  }

  function updateCampo(idx, field, value) {
    const next = camposValidacion.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    onChange({ ...data, camposValidacion: next })
  }

  function addCampo() {
    onChange({ ...data, camposValidacion: [...camposValidacion, { campo: '', label: '' }] })
  }

  function removeCampo(idx) {
    onChange({ ...data, camposValidacion: camposValidacion.filter((_, i) => i !== idx) })
  }

  const DRENAJE_KEYS = ['penrose', 'jackson-pratt', 'hemovac']

  return (
    <div>
      <div className="admin-editor" style={{ marginBottom: '24px' }}>
        <div className="admin-editor-header">
          <h3>Textos de drenaje</h3>
          <p className="admin-editor-desc">
            Texto que se inserta en la sección Final cuando se selecciona cada tipo de drenaje.
            Si no hay drenaje seleccionado, se usa "sin dejar drenajes,".
          </p>
        </div>
        {DRENAJE_KEYS.map(key => (
          <div key={key} className="campo" style={{ marginBottom: '12px' }}>
            <label>{key}</label>
            <input
              type="text"
              value={textosDrenaje[key] ?? ''}
              onChange={e => updateDrenaje(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="admin-editor">
        <div className="admin-editor-header">
          <h3>Campos de validación de horario</h3>
          <p className="admin-editor-desc">
            Horas que deben estar completas antes de generar la nota. El campo "campo" debe
            coincidir con el nombre del campo en el formulario (ej: hIngreso).
          </p>
        </div>
        <div className="admin-list">
          {camposValidacion.map((c, idx) => (
            <div key={idx} className="admin-list-row">
              <input
                type="text"
                value={c.campo}
                placeholder="campo (ej: hIngreso)"
                style={{ width: '160px' }}
                onChange={e => updateCampo(idx, 'campo', e.target.value)}
              />
              <input
                type="text"
                value={c.label}
                placeholder="etiqueta (ej: 1. Ingreso)"
                onChange={e => updateCampo(idx, 'label', e.target.value)}
              />
              <button type="button" className="btn-admin-remove" onClick={() => removeCampo(idx)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-admin-add" onClick={addCampo}>
          + Agregar campo
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const TABS = [
  { key: 'procedimientos', label: 'Procedimientos' },
  { key: 'anestesia', label: 'Anestesia' },
  { key: 'config', label: 'Configuración' },
]

export default function AdminPlantillasPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('procedimientos')
  const [activeProcedure, setActiveProcedure] = useState('colelap')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    plantillasService.fetchAll()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setData({ ...DEFAULT_PLANTILLAS }); setLoading(false) })
  }, [])

  function updateProcedure(key, value) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaveError(null)
    setSaveMsg('')
    setSaving(true)
    try {
      if (activeTab === 'procedimientos') {
        await plantillasService.save(activeProcedure, data[activeProcedure])
        setSaveMsg(`Plantilla "${PROCEDIMIENTOS.find(p => p.key === activeProcedure)?.label}" guardada.`)
      } else if (activeTab === 'anestesia') {
        await plantillasService.save('_anestesia', data._anestesia)
        setSaveMsg('Plantillas de anestesia guardadas.')
      } else if (activeTab === 'config') {
        await plantillasService.save('_config', data._config)
        setSaveMsg('Configuración guardada.')
      }
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleRestore() {
    if (!window.confirm('¿Restaurar los valores por defecto de esta sección? Los cambios no guardados se perderán.')) return
    if (activeTab === 'procedimientos') {
      updateProcedure(activeProcedure, DEFAULT_PLANTILLAS[activeProcedure])
    } else if (activeTab === 'anestesia') {
      setData(prev => ({ ...prev, _anestesia: DEFAULT_PLANTILLAS._anestesia }))
    } else if (activeTab === 'config') {
      setData(prev => ({ ...prev, _config: DEFAULT_PLANTILLAS._config }))
    }
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <p style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando plantillas…</p>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Plantillas de notas</h2>
          <p>
            Edita los textos de las notas quirúrgicas. Usa <code>{'{{variable}}'}</code> para
            insertar valores dinámicos del formulario.
          </p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      {/* Tabs principales */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--accent, #2563eb)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs de procedimientos */}
      {activeTab === 'procedimientos' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {PROCEDIMIENTOS.map(proc => (
            <button
              key={proc.key}
              type="button"
              onClick={() => setActiveProcedure(proc.key)}
              style={{
                padding: '6px 16px',
                border: `2px solid ${activeProcedure === proc.key ? 'var(--accent, #2563eb)' : 'var(--border)'}`,
                background: activeProcedure === proc.key ? 'var(--accent-subtle, #eff6ff)' : 'transparent',
                color: activeProcedure === proc.key ? 'var(--accent, #2563eb)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: activeProcedure === proc.key ? 600 : 400,
                fontSize: '13px',
              }}
            >
              {proc.label}
            </button>
          ))}
        </div>
      )}

      {/* Contenido del tab activo */}
      {activeTab === 'procedimientos' && data && (
        <SeccionProcedimiento
          data={data[activeProcedure]}
          onChange={value => updateProcedure(activeProcedure, value)}
        />
      )}

      {activeTab === 'anestesia' && data && (
        <SeccionAnestesia
          data={data._anestesia}
          onChange={value => setData(prev => ({ ...prev, _anestesia: value }))}
        />
      )}

      {activeTab === 'config' && data && (
        <SeccionConfig
          data={data._config}
          onChange={value => setData(prev => ({ ...prev, _config: value }))}
        />
      )}

      {/* Acciones globales */}
      <div className="admin-actions" style={{ marginTop: '24px' }}>
        {saveError && <p className="admin-error">{saveError}</p>}
        {saveMsg && <p className="admin-success">{saveMsg}</p>}
        <div className="admin-actions-buttons">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={handleRestore}
            disabled={saving}
          >
            Restaurar por defecto
          </button>
          <button
            type="button"
            className="btn-admin-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
