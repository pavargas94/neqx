import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { seedService } from '../../services/seedService'

export default function AdminSeedPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [force, setForce] = useState(false)
  const [includePersonal, setIncludePersonal] = useState(true)

  async function refreshStatus() {
    setLoading(true)
    setError(null)
    try {
      const s = await seedService.getStatus()
      setStatus(s)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  async function handleSeed() {
    const msg = force
      ? '¿Sobrescribir las colecciones existentes con los datos por defecto?'
      : '¿Poblar Firestore con los datos iniciales? Solo se escribirán colecciones vacías.'
    if (!window.confirm(msg)) return

    setSeeding(true)
    setError(null)
    setResult(null)
    try {
      const res = await seedService.seedAll({ force, includePersonal })
      setResult(res)
      await refreshStatus()
    } catch (e) {
      setError(e.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>Poblar Firestore</h2>
          <p>
            Migra los datos locales (especialidades, plantillas y personal) a las nuevas
            colecciones de Firestore. Ejecuta esto una sola vez al desplegar el nuevo modelo.
          </p>
        </div>
        <button type="button" className="btn-admin-back" onClick={() => navigate('/')}>
          ← Volver al formulario
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '16px 0' }}>Consultando estado de Firestore…</p>
      ) : !status?.configured ? (
        <p className="admin-error">Firebase no está configurado. Revisa tu archivo .env.local.</p>
      ) : (
        <div className="admin-editor">
          <div className="admin-editor-header">
            <h3>Estado actual</h3>
          </div>
          <ul style={{ margin: '0 0 20px', paddingLeft: '20px', lineHeight: 1.8 }}>
            <li>
              <strong>especialidades/</strong>: {status.especialidades} documento(s)
            </li>
            <li>
              <strong>plantillas/</strong>: {status.plantillas} documento(s)
            </li>
            <li>
              <strong>personal/</strong> (nuevo modelo): {status.personal} documento(s)
            </li>
            <li>
              <strong>personal/settings</strong> (legado):{' '}
              {status.hasLegacySettings ? 'existe' : 'no existe'}
            </li>
          </ul>

          <label className="admin-checkbox" style={{ display: 'block', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={includePersonal}
              onChange={e => setIncludePersonal(e.target.checked)}
            />
            Incluir personal (documentos individuales desde personal/settings o datos locales)
          </label>

          <label className="admin-checkbox" style={{ display: 'block', marginBottom: '20px' }}>
            <input
              type="checkbox"
              checked={force}
              onChange={e => setForce(e.target.checked)}
            />
            Forzar sobrescritura (reemplaza datos existentes en las colecciones seleccionadas)
          </label>

          <div className="admin-actions">
            {error && <p className="admin-error">{error}</p>}
            {result && (
              <p className="admin-success">
                Listo: {result.especialidades} especialidades, {result.plantillas} plantillas,{' '}
                {result.personal} personal.
                {result.skipped.length > 0 && ` Omitido: ${result.skipped.join(', ')}.`}
              </p>
            )}
            <div className="admin-actions-buttons">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={refreshStatus}
                disabled={seeding}
              >
                Actualizar estado
              </button>
              <button
                type="button"
                className="btn-admin-save"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? 'Poblando…' : 'Poblar colecciones'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-editor" style={{ marginTop: '24px' }}>
        <div className="admin-editor-header">
          <h3>Qué se escribe en cada colección</h3>
        </div>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px' }}>Colección</th>
              <th style={{ padding: '8px' }}>Documentos</th>
              <th style={{ padding: '8px' }}>Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}><code>especialidades/</code></td>
              <td style={{ padding: '8px' }}>general, ortopedia, ginecologia</td>
              <td style={{ padding: '8px' }}>src/data/especialidades.js + labels/muestras</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}><code>plantillas/</code></td>
              <td style={{ padding: '8px' }}>colelap, histerectomia, reemplazo, _anestesia, _config</td>
              <td style={{ padding: '8px' }}>src/data/plantillasDefaults.js</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}><code>personal/</code></td>
              <td style={{ padding: '8px' }}>Un doc por cirujano, ayudante, anestesiólogo, instrumentador</td>
              <td style={{ padding: '8px' }}>personal/settings en Firestore o constants.js local</td>
            </tr>
          </tbody>
        </table>
        <p className="admin-editor-desc" style={{ marginTop: '12px' }}>
          <strong>Nota:</strong> <code>personal/settings</code> y <code>medicacion/settings</code> no
          se modifican. El formulario actual sigue usándolos hasta que migres el frontend al nuevo modelo.
        </p>
      </div>
    </div>
  )
}
