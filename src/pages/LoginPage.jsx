import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { clearAuthError, login } from '../store/authSlice'

function BrandLogo() {
  return (
    <div className="login-brand">
      <svg className="login-logo-icono" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="#333333" />
        <path d="M32 14 v36 M14 32 h36" stroke="#f5f5f5" strokeWidth="5.5" strokeLinecap="round" />
        <path
          d="M19 32 h4 l2.5 -7.5 l3.5 15 L32.5 25 l2.5 7.5 h8"
          fill="none"
          stroke="#212121"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="login-logo-texto" viewBox="0 0 140 42" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="26"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontSize="25"
          fontWeight="900"
          fill="#212121"
          letterSpacing="0.5"
        >
          NEQ<tspan fill="#616161">x</tspan>
        </text>
        <text
          x="1"
          y="37"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontSize="7.5"
          fontWeight="bold"
          fill="#757575"
          letterSpacing="0.2"
        >
          NOTAS DE ENFERMERÍA
        </text>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, firebaseConfigured } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <BrandLogo />

        <div className="login-header">
          <h1>Iniciar sesión</h1>
          <p>Plataforma de documentación clínica de enfermería</p>
        </div>

        {!firebaseConfigured && (
          <p className="login-config-warning">
            Firebase no está configurado. Crea un archivo <code>.env.local</code> con las
            variables <code>VITE_FIREBASE_*</code> (ver <code>.env.example</code>).
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) dispatch(clearAuthError())
              }}
              placeholder="profesional@clinica.com"
              disabled={loading || !firebaseConfigured}
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) dispatch(clearAuthError())
              }}
              placeholder="••••••••"
              disabled={loading || !firebaseConfigured}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading || !firebaseConfigured}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">
          Acceso restringido al personal autorizado de la institución.
        </p>
      </div>
    </div>
  )
}
