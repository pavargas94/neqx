import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from './store/authSlice'
import { authService } from './services/authService'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function AppRoutes() {
  const dispatch = useDispatch()
  const { user, initialized } = useSelector((state) => state.auth)

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((firebaseUser) => {
      dispatch(setUser(firebaseUser))
    })

    return unsubscribe
  }, [dispatch])

  if (!initialized) {
    return (
      <div className="auth-loading">
        <p>Cargando NEQx…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
