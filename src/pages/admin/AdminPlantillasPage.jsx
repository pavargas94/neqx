import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { plantillasService } from '../../services/plantillasService'
import { especialidadesService } from '../../services/especialidadesService'
import { DEFAULT_PLANTILLAS } from '../../data/plantillasDefaults'
import { OPCIONES_DEFAULTS, FLAGS_DEFAULTS } from '../../data/procedimientoOpcionesDefaults'
import { buildPlantillasPorEspecialidad } from '../../utils/procedimientosHelpers'
import {
  buildCatalogoProcedimiento,
  VARIABLES_ANESTESIA,
  VARIABLES_ESTATICAS,
  buildVariablesDinamicas,
} from '../../utils/plantillaVariables'
import VariablesReferenciaPanel from '../../components/admin/VariablesReferenciaPanel'
import {
  mergePlantillaImport,
  parsePlantillaJson,
  PLANTILLA_JSON_EJEMPLO,
} from '../../utils/plantillaJsonImport'
import { fetchFormConstants } from '../../store/constantsSlice'

// Claves de sistema (no son procedimientos)
const SYSTEM_KEYS = new Set(['_anestesia', '_config'])

// Claves de las plantillas predefinidas (no se pueden eliminar)
const DEFAULT_KEYS = new Set(['colelap', 'histerectomia', 'reemplazo'])

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

// Plantilla base con todas las variables disponibles listadas por sección
const PLANTILLA_BASE = {
  secciones: {
    ingreso: `{{h1}} Ingreso
{{sala}}
{{cirujano}}
{{ayudante}}
{{calibre}}
{{ubicacionVena}}
{{miembro}}
{{placaBisturi}}
{{tipoHernia}}
{{tipoHerniaTexto}}`,
    lavado: `{{h3}} Lavado quirúrgico
{{personaLavado}}
{{sondaFoley}}
{{caracteristicaOrina}}`,
    inicio: `{{h4}} Inicio de cirugía
{{cirujano}}{{textoAyudante}}
{{segundoCirujano}}
{{tipoReemplazoTexto}}
{{lateralidadRodilla}}
{{stringConteoMaterial}}
{{instrumentador}}
{{casa}}
{{tipoBloqueo}}
{{lateralidadBloqueo}}
{{stringAnestBloqueo}}`,
    medicacion: `{{h5}} Medicación
{{anestesiologo}}
{{stringMedsFinal}}`,
    final: `{{h6}} Final de cirugía
{{textoDrenajeFinal}}
{{textoDrenajeFinalSinComa}}
{{stringConteoMaterial}}
{{textoPatologiaFinal}}
{{lateralidadRodilla}}`,
    traslado: `{{h7}} Traslado a recuperación
{{sufijoAnestesiaRecup}}
{{ubicacionVena}}
{{miembro}}
{{sondaFoley}}
{{caracteristicaOrina}}
{{lateralidadRodilla}}`,
  },
  sufijoAnestesia: {
    raquidea: 'regional raquídea',
    general: 'general',
    fallo_raquidea: 'general secundaria a conversión por fallo de anestesia raquídea',
  },
}

// ─── Normaliza una clave técnica desde el nombre ───────────────────────────────
function labelToKey(label) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

// ─── Botón de procedimiento ────────────────────────────────────────────────────

function BotonProcedimiento({ proc, active, onClick }) {
  return (
    <button
      type="button"
      className={`plantilla-proc-btn${active ? ' plantilla-proc-btn--active' : ''}`}
      onClick={onClick}
    >
      {proc.label}
      {!proc.isDefault && <span className="plantilla-proc-badge">personalizada</span>}
    </button>
  )
}

// ─── Modal para crear nueva plantilla ─────────────────────────────────────────

function ModalNuevaPlantilla({ existingKeys, procedimientos, especialidades, saving, onConfirm, onCancel }) {
  const [nombre, setNombre] = useState('')
  const [copiarDe, setCopiarDe] = useState('vacia')
  const [especialidadId, setEspecialidadId] = useState(especialidades[0]?.id || '')
  const [error, setError] = useState('')

  const keyPreview = nombre ? labelToKey(nombre) : ''
  const isDuplicate = keyPreview && existingKeys.has(keyPreview)

  const catalogoVariables = useMemo(() => {
    if (!keyPreview) return VARIABLES_ESTATICAS
    const dinamicas = buildVariablesDinamicas(especialidades, keyPreview)
    if (!dinamicas.length) return VARIABLES_ESTATICAS
    return [
      { grupo: `Campos adicionales — ${keyPreview}`, variables: dinamicas, esDinamico: true },
      ...VARIABLES_ESTATICAS,
    ]
  }, [especialidades, keyPreview])

  function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!keyPreview) { setError('El nombre genera una clave vacía. Usa letras o números.'); return }
    if (!especialidadId) { setError('Selecciona una especialidad quirúrgica.'); return }
    if (isDuplicate) { setError(`Ya existe una plantilla con la clave "${keyPreview}".`); return }
    onConfirm({ nombre: nombre.trim(), key: keyPreview, copiarDe, especialidadId })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box--plantilla" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Nueva plantilla de procedimiento</h3>
        <div className="modal-plantilla-layout">
          <form onSubmit={handleSubmit} className="modal-plantilla-form">
          <div className="campo" style={{ marginBottom: '16px' }}>
            <label>Nombre del procedimiento <span style={{ color: 'var(--error, #ef4444)' }}>*</span></label>
            <input
              type="text"
              value={nombre}
              autoFocus
              placeholder="Ej: Apendicectomía laparoscópica"
              onChange={e => { setNombre(e.target.value); setError('') }}
            />
            {keyPreview && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: isDuplicate ? 'var(--error, #ef4444)' : 'var(--text-secondary)' }}>
                Clave técnica: <code>{keyPreview}</code>{isDuplicate ? ' — ya existe' : ''}
              </p>
            )}
          </div>

          <div className="campo" style={{ marginBottom: '16px' }}>
            <label>Especialidad quirúrgica <span style={{ color: 'var(--error, #ef4444)' }}>*</span></label>
            <select
              value={especialidadId}
              onChange={e => { setEspecialidadId(e.target.value); setError('') }}
              disabled={especialidades.length === 0}
            >
              {especialidades.length === 0 ? (
                <option value="">Sin especialidades disponibles</option>
              ) : (
                especialidades.map(esp => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))
              )}
            </select>
          </div>

          <div className="campo" style={{ marginBottom: '20px' }}>
            <label>Inicializar con</label>
            <select value={copiarDe} onChange={e => setCopiarDe(e.target.value)}>
              <option value="vacia">Plantilla vacía (con variables de referencia)</option>
              {procedimientos.map(proc => (
                <option key={proc.key} value={proc.key}>
                  Copiar de: {proc.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={{ color: 'var(--error, #ef4444)', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-admin-secondary" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-admin-save" disabled={saving || especialidades.length === 0}>
              {saving ? 'Creando…' : 'Crear plantilla'}
            </button>
          </div>
          </form>

          <VariablesReferenciaPanel
            titulo="Variables para la plantilla"
            grupos={catalogoVariables}
            compact
          />
        </div>
      </div>
    </div>
  )
}

// ─── Importar plantilla desde JSON ────────────────────────────────────────────

function PlantillaJsonImport({ procedureKey, onImport }) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleImport() {
    setError('')
    setSuccess('')

    const result = parsePlantillaJson(jsonInput)
    if (result.error) {
      setError(result.error)
      return
    }

    if (
      result.data.procedimientoKey
      && result.data.procedimientoKey !== procedureKey
      && !window.confirm(
        `El JSON indica la clave "${result.data.procedimientoKey}" pero estás editando "${procedureKey}". ¿Importar de todos modos?`,
      )
    ) {
      return
    }

    onImport(result.data)
    setSuccess('Plantilla importada. Revisa las secciones y pulsa Guardar cambios.')
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <details className="plantilla-json-import">
      <summary className="plantilla-json-import-summary">
        Importar desde JSON (IA)
      </summary>
      <div className="plantilla-json-import-body">
        <p className="admin-editor-desc">
          Pega el JSON generado por la IA. Se reemplazarán las secciones y sufijos de anestesia
          de la plantilla actual (<code>{procedureKey}</code>).
        </p>
        <textarea
          className="plantilla-json-import-textarea"
          value={jsonInput}
          rows={6}
          placeholder={PLANTILLA_JSON_EJEMPLO}
          onChange={e => { setJsonInput(e.target.value); setError(''); setSuccess('') }}
        />
        {error && <p className="plantilla-json-import-error">{error}</p>}
        {success && <p className="plantilla-json-import-success">{success}</p>}
        <div className="plantilla-json-import-actions">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => { setJsonInput(''); setError(''); setSuccess('') }}
          >
            Limpiar
          </button>
          <button
            type="button"
            className="btn-admin-save"
            onClick={handleImport}
            disabled={!jsonInput.trim()}
          >
            Importar JSON
          </button>
        </div>
      </div>
    </details>
  )
}

// ─── Sección de Procedimiento ─────────────────────────────────────────────────

function SeccionProcedimiento({ data, onChange, especialidades, procedureKey }) {
  const secciones = data?.secciones ?? {}
  const sufijoAnestesia = data?.sufijoAnestesia ?? {}

  const catalogoVariables = useMemo(
    () => buildCatalogoProcedimiento(especialidades, procedureKey),
    [especialidades, procedureKey],
  )

  function updateSeccion(key, value) {
    onChange({ ...data, secciones: { ...secciones, [key]: value } })
  }

  function updateSufijo(key, value) {
    onChange({ ...data, sufijoAnestesia: { ...sufijoAnestesia, [key]: value } })
  }

  function handleImportJson(imported) {
    onChange(mergePlantillaImport(data, imported))
  }

  return (
    <div className="plantilla-editor-layout">
      <div className="plantilla-editor-main">
        <PlantillaJsonImport
          procedureKey={procedureKey}
          onImport={handleImportJson}
        />

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

      <VariablesReferenciaPanel
        titulo="Variables disponibles"
        grupos={catalogoVariables}
      />
    </div>
  )
}

// ─── Sección de Anestesia ─────────────────────────────────────────────────────

function SeccionAnestesia({ data, onChange }) {
  return (
    <div className="plantilla-editor-layout">
      <div className="plantilla-editor-main">
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
      </div>

      <VariablesReferenciaPanel
        titulo="Variables de anestesia"
        grupos={VARIABLES_ANESTESIA}
      />
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
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('procedimientos')
  const [activeProcedure, setActiveProcedure] = useState('colelap')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState(null)
  const [showModalCrear, setShowModalCrear] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      plantillasService.fetchAll(),
      especialidadesService.fetchAll(),
    ])
      .then(([plantillas, esp]) => {
        setData(plantillas)
        setEspecialidades(esp)
        setLoading(false)
      })
      .catch(() => {
        setData({ ...DEFAULT_PLANTILLAS })
        setEspecialidades([])
        setLoading(false)
      })
  }, [])

  const { grupos, sinCategoria } = useMemo(
    () => buildPlantillasPorEspecialidad(especialidades, data, {
      systemKeys: SYSTEM_KEYS,
      defaultKeys: DEFAULT_KEYS,
    }),
    [especialidades, data],
  )

  const procedimientos = useMemo(
    () => [...grupos.flatMap(grupo => grupo.procedimientos), ...sinCategoria],
    [grupos, sinCategoria],
  )

  const existingKeys = new Set(procedimientos.map(p => p.key))

  function pickNextProcedure(activeKey, nextData) {
    const { grupos: nextGrupos, sinCategoria: nextSinCategoria } = buildPlantillasPorEspecialidad(
      especialidades,
      nextData,
      { systemKeys: SYSTEM_KEYS, defaultKeys: DEFAULT_KEYS },
    )
    const remaining = [
      ...nextGrupos.flatMap(grupo => grupo.procedimientos),
      ...nextSinCategoria,
    ]
    if (remaining.length === 0) return 'colelap'
    if (remaining.some(proc => proc.key === activeKey)) return activeKey
    return remaining[0].key
  }

  function updateProcedure(key, value) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  // ── Guardar ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveError(null)
    setSaveMsg('')
    setSaving(true)
    try {
      if (activeTab === 'procedimientos') {
        await plantillasService.save(activeProcedure, data[activeProcedure])
        const label = data[activeProcedure]?.label || activeProcedure
        setSaveMsg(`Plantilla "${label}" guardada.`)
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

  // ── Restaurar ─────────────────────────────────────────────────────────────────
  function handleRestore() {
    if (!window.confirm('¿Restaurar los valores por defecto de esta sección? Los cambios no guardados se perderán.')) return
    if (activeTab === 'procedimientos') {
      if (!DEFAULT_KEYS.has(activeProcedure)) return
      updateProcedure(activeProcedure, DEFAULT_PLANTILLAS[activeProcedure])
    } else if (activeTab === 'anestesia') {
      setData(prev => ({ ...prev, _anestesia: DEFAULT_PLANTILLAS._anestesia }))
    } else if (activeTab === 'config') {
      setData(prev => ({ ...prev, _config: DEFAULT_PLANTILLAS._config }))
    }
  }

  // ── Crear nueva plantilla ────────────────────────────────────────────────────
  async function handleConfirmarCrear({ nombre, key, copiarDe, especialidadId }) {
    setSaveError(null)
    setSaveMsg('')
    setCreating(true)

    try {
      const esp = especialidades.find(e => e.id === especialidadId)
      if (!esp) throw new Error('Especialidad no encontrada.')

      const base = copiarDe !== 'vacia' && data?.[copiarDe]
        ? { ...data[copiarDe], label: nombre, procedimientoKey: key }
        : {
            ...PLANTILLA_BASE,
            label: nombre,
            procedimientoKey: key,
            secciones: { ...PLANTILLA_BASE.secciones },
            sufijoAnestesia: { ...PLANTILLA_BASE.sufijoAnestesia },
          }

      const labelCirujano = esp.procedimientos?.find(p => p.labelCirujano)?.labelCirujano || 'Cirujano Principal:'
      const nuevoProc = {
        key,
        nombre,
        labelCirujano,
        muestraDefault: '',
        activo: true,
        opciones: OPCIONES_DEFAULTS[key] || [],
        flags: FLAGS_DEFAULTS[key] || {},
      }

      const yaEnEspecialidad = esp.procedimientos?.some(p => p.key === key)
      const espActualizada = {
        ...esp,
        procedimientos: yaEnEspecialidad
          ? esp.procedimientos.map(p => p.key === key ? { ...p, nombre, activo: true } : p)
          : [...(esp.procedimientos || []), nuevoProc],
      }

      if (especialidadesService.isConfigured()) {
        await especialidadesService.save(esp.id, espActualizada)
      }

      setData(prev => ({ ...prev, [key]: base }))
      setEspecialidades(prev => prev.map(e => e.id === esp.id ? espActualizada : e))
      await dispatch(fetchFormConstants())
      setActiveProcedure(key)
      setShowModalCrear(false)
      setSaveMsg(`Plantilla "${nombre}" creada en ${esp.nombre}. Edítala y guarda cuando esté lista.`)
      setTimeout(() => setSaveMsg(''), 4000)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setCreating(false)
    }
  }

  // ── Eliminar plantilla ───────────────────────────────────────────────────────
  async function handleEliminar(key) {
    const label = data?.[key]?.label || key
    if (!window.confirm(`¿Eliminar la plantilla "${label}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    setSaveError(null)
    try {
      await plantillasService.delete(key)
      const next = { ...data }
      delete next[key]
      setData(next)
      setActiveProcedure(pickNextProcedure(activeProcedure, next))
      setSaveMsg(`Plantilla "${label}" eliminada.`)
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const activeSinCategoria = sinCategoria.some(proc => proc.key === activeProcedure)

  if (loading) {
    return (
      <div className="admin-panel">
        <p style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando plantillas…</p>
      </div>
    )
  }

  const canRestore = activeTab === 'procedimientos' ? DEFAULT_KEYS.has(activeProcedure) : true
  const canDelete = activeTab === 'procedimientos' && !DEFAULT_KEYS.has(activeProcedure)

  return (
    <div className="admin-panel">
      {showModalCrear && (
        <ModalNuevaPlantilla
          existingKeys={existingKeys}
          procedimientos={procedimientos}
          especialidades={especialidades}
          saving={creating}
          onConfirm={handleConfirmarCrear}
          onCancel={() => setShowModalCrear(false)}
        />
      )}

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

      {/* Procedimientos agrupados por especialidad */}
      {activeTab === 'procedimientos' && (
        <div className="plantillas-categorias">
          {grupos.map(grupo => (
            <section key={grupo.id} className="plantillas-categoria">
              <h4 className="plantillas-categoria-titulo">{grupo.nombre}</h4>
              <div className="plantillas-categoria-lista">
                {grupo.procedimientos.map(proc => (
                  <BotonProcedimiento
                    key={proc.key}
                    proc={proc}
                    active={activeProcedure === proc.key}
                    onClick={() => setActiveProcedure(proc.key)}
                  />
                ))}
              </div>
            </section>
          ))}

          {sinCategoria.length > 0 && (
            <section className="plantillas-categoria">
              <h4 className="plantillas-categoria-titulo">Sin categoría</h4>
              <p className="plantillas-categoria-desc">
                Plantillas sin procedimiento asignado en Admin → Especialidades.
              </p>
              <div className="plantillas-categoria-lista">
                {sinCategoria.map(proc => (
                  <BotonProcedimiento
                    key={proc.key}
                    proc={proc}
                    active={activeProcedure === proc.key}
                    onClick={() => setActiveProcedure(proc.key)}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="plantillas-categorias-actions">
            <button
              type="button"
              className="plantilla-proc-btn plantilla-proc-btn--nueva"
              onClick={() => setShowModalCrear(true)}
            >
              + Nueva plantilla
            </button>
          </div>
        </div>
      )}

      {/* Nota informativa para plantillas sin especialidad */}
      {activeTab === 'procedimientos' && activeSinCategoria && (
        <div style={{
          background: 'var(--accent-subtle, #eff6ff)',
          border: '1px solid var(--accent, #2563eb)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--accent, #2563eb)',
        }}>
          Esta plantilla no está asignada a ninguna especialidad. Regístrala en{' '}
          <strong>Admin → Especialidades</strong> con la clave <code>{activeProcedure}</code>{' '}
          para que aparezca en el formulario.
        </div>
      )}

      {/* Contenido del tab activo */}
      {activeTab === 'procedimientos' && data && data[activeProcedure] && (
        <SeccionProcedimiento
          data={data[activeProcedure]}
          especialidades={especialidades}
          procedureKey={activeProcedure}
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
          {canDelete && (
            <button
              type="button"
              className="btn-admin-remove"
              onClick={() => handleEliminar(activeProcedure)}
              disabled={deleting || saving}
              style={{ marginRight: 'auto' }}
            >
              {deleting ? 'Eliminando…' : 'Eliminar plantilla'}
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={handleRestore}
              disabled={saving}
            >
              Restaurar por defecto
            </button>
          )}
          <button
            type="button"
            className="btn-admin-save"
            onClick={handleSave}
            disabled={saving || deleting}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
