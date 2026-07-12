import { useState } from 'react'
import { formatVariable } from '../../utils/plantillaVariables'

function VariableChip({ variable, onCopy }) {
  const [copiado, setCopiado] = useState(false)

  async function handleCopy() {
    const texto = formatVariable(variable.key)
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      onCopy?.(texto)
      setTimeout(() => setCopiado(false), 1200)
    } catch {
      // fallback silencioso
    }
  }

  return (
    <button
      type="button"
      className={`variable-chip${variable.dinamica ? ' variable-chip--dinamica' : ''}${copiado ? ' variable-chip--copiado' : ''}`}
      title={variable.descripcion}
      onClick={handleCopy}
    >
      <code>{formatVariable(variable.key)}</code>
      <span className="variable-chip-desc">{variable.descripcion}</span>
    </button>
  )
}

export default function VariablesReferenciaPanel({ titulo, grupos, compact = false }) {
  const [mensaje, setMensaje] = useState('')

  if (!grupos?.length) return null

  return (
    <aside className={`variables-referencia${compact ? ' variables-referencia--compact' : ''}`}>
      <div className="variables-referencia-header">
        <h4>{titulo}</h4>
        <p>Clic para copiar al portapapeles.</p>
        {mensaje && <span className="variables-referencia-msg">{mensaje}</span>}
      </div>

      <div className="variables-referencia-body">
        {grupos.map(grupo => (
          <section key={grupo.grupo} className="variables-grupo">
            <h5 className={`variables-grupo-titulo${grupo.esDinamico ? ' variables-grupo-titulo--dinamico' : ''}`}>
              {grupo.grupo}
              {grupo.esDinamico && <span className="variable-chip-badge">Firestore</span>}
            </h5>
            <div className="variables-grupo-lista">
              {grupo.variables.map(variable => (
                <VariableChip
                  key={variable.key}
                  variable={variable}
                  onCopy={() => setMensaje(`Copiado ${formatVariable(variable.key)}`)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
