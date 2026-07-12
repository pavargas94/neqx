import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  async function handleLogout() {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="brand-logos">
        <svg className="logo-icono" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#333333" />
          <path d="M32 14 v36 M14 32 h36" stroke="#f5f5f5" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M19 32 h4 l2.5 -7.5 l3.5 15 L32.5 25 l2.5 7.5 h8" fill="none" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="logo-texto" viewBox="0 0 140 42" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="26" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="25" fontWeight="900" fill="#212121" letterSpacing="0.5">
            NEQ<tspan fill="#616161">x</tspan>
          </text>
          <text x="1" y="37" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="7.5" fontWeight="bold" fill="#757575" letterSpacing="0.2">
            NOTAS DE ENFERMERÍA
          </text>
        </svg>
      </div>
      <div className="header-actions">
        {user && (
          <span className="user-tag" title={user.email}>
            {user.displayName || user.email}
          </span>
        )}
        <span className="version-tag">PUNTO DE CONTROL v3.3.0</span>
        {user && (
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  )
}
