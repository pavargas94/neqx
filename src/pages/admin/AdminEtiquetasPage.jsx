import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import KeyValueEditor from '../../components/admin/KeyValueEditor'
import { especialidadesService } from '../../services/especialidadesService'
import { fetchFormConstants } from '../../store/constantsSlice'
import { AdminSectionActions } from './AdminLayout'

const PROCEDURE_KEYS = ['colelap', 'histerectomia', 'reemplazo']

const PROCEDURE_ESP = {
  colelap: 'general',
  histerectomia: 'ginecologia',
  reemplazo: 'ortopedia',
}

function buildDraftFromEspecialidades(especialidades) {
  const draft = {}
  for (const key of PROCEDURE_KEYS) {
    const espId = PROCEDURE_ESP[key]
    const esp = especialidades.find(e => e.id === espId)
    const proc = esp?.procedimientos?.find(p => p.key === key)
    draft[key] = proc?.labelCirujano || ''
  }
  return draft
}

function applyDraftToEspecialidades(especialidades, draft) {
  return especialidades.map(esp => ({
    ...esp,
    procedimientos: (esp.procedimientos || []).map(proc =>
      PROCEDURE_KEYS.includes(proc.key)
        ? { ...proc, labelCirujano: draft[proc.key] || proc.labelCirujano }
        : proc,
    ),
  }))
}

export default function AdminEtiquetasPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState({})
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    especialidadesService.fetchAll()
      .then(data => {
        setEspecialidades(data)
        setDraft(buildDraftFromEspecialidades(data))
        setLoading(false)
      })
      .catch(error => {
        setSaveError(error.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  const handleCancel = useCallback(() => {
    setDraft(buildDraftFromEspecialidades(especialidades))
    setSaveError(null)
    setSaveSuccess(false)
  }, [especialidades])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = applyDraftToEspecialidades(especialidades, draft)
      await Promise.all(updated.map(esp => especialidadesService.save(esp.id, esp)))
      setEspecialidades(updated)
      await dispatch(fetchFormConstants())
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Etiquetas de cirujano</h2>
          <p>Texto del label del select principal de cirujano por procedimiento.</p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '16px 0' }}>Cargando etiquetas…</p>
      ) : (
        <>
          <KeyValueEditor
            title="Etiquetas por procedimiento"
            data={draft}
            onChange={setDraft}
            placeholders={{
              colelap: 'Cirujano Principal:',
              histerectomia: 'Cirujano Ginecólogo:',
              reemplazo: 'Cirujano de Reemplazos:',
            }}
          />
          <AdminSectionActions
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  )
}
