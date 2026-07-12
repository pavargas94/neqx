import { useRef } from 'react'
import { useSelector } from 'react-redux'

export default function ResultsPanel() {
  const nota = useSelector(s => s.report.nota)
  const btnRef = useRef(null)

  function copiarAlPortapapeles() {
    if (!nota) return
    navigator.clipboard.writeText(nota).then(() => {
      const btn = btnRef.current
      if (!btn) return
      btn.textContent = '¡COPIADO!'
      btn.style.backgroundColor = '#212121'
      setTimeout(() => {
        btn.textContent = '📋 COPIAR AL PORTAPAPELES'
        btn.style.backgroundColor = '#424242'
      }, 1500)
    })
  }

  return (
    <div className="panel-resultados">
      <h2 className="titulo-reporte">📋 Bloque Narrativo Unificado</h2>
      <button
        ref={btnRef}
        className="btn-copiar-todo"
        onClick={copiarAlPortapapeles}
      >
        📋 COPIAR AL PORTAPAPELES
      </button>
      <div className="contenedor-texto-unico">
        <textarea
          className="texto-final"
          readOnly
          value={nota}
          placeholder="Introduce los datos a la izquierda y presiona el botón de generar..."
        />
      </div>
    </div>
  )
}
