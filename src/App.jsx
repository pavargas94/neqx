import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from './store/authSlice'
import { fetchFormConstants } from './store/constantsSlice'
import { authService } from './services/authService'
import { plantillasService } from './services/plantillasService'
import { ROLES } from './utils/roles'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminCirujanosPage from './pages/admin/AdminCirujanosPage'
import AdminAyudantesPage from './pages/admin/AdminAyudantesPage'
import AdminSegundosCirujanosPage from './pages/admin/AdminSegundosCirujanosPage'
import AdminAnestesiologosPage from './pages/admin/AdminAnestesiologosPage'
import AdminInstrumentadoresPage from './pages/admin/AdminInstrumentadoresPage'
import AdminMedicamentosPage from './pages/admin/AdminMedicamentosPage'
import AdminEtiquetasPage from './pages/admin/AdminEtiquetasPage'
import AdminEspecialidadesPage from './pages/admin/AdminEspecialidadesPage'
import AdminPlantillasPage from './pages/admin/AdminPlantillasPage'
import AdminSeedPage from './pages/admin/AdminSeedPage'

function AppRoutes() {
  const dispatch = useDispatch()
  const { user, initialized } = useSelector((state) => state.auth)
  const { loaded: constantsLoaded, loading: constantsLoading } = useSelector((state) => state.constants)

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((firebaseUser) => {
      dispatch(setUser(firebaseUser))
    })

    return unsubscribe
  }, [dispatch])

  useEffect(() => {
    if (user && !constantsLoaded && !constantsLoading) {
      dispatch(fetchFormConstants())
    }
  }, [user, constantsLoaded, constantsLoading, dispatch])

  useEffect(() => {
    if (user) {
      plantillasService.preload()
    }
  }, [user])

  if (!initialized || (user && !constantsLoaded)) {
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/cirujanos" replace />} />
        <Route path="cirujanos" element={<AdminCirujanosPage />} />
        <Route path="ayudantes" element={<AdminAyudantesPage />} />
        <Route path="segundos-cirujanos" element={<AdminSegundosCirujanosPage />} />
        <Route path="anestesiologos" element={<AdminAnestesiologosPage />} />
        <Route path="instrumentadores" element={<AdminInstrumentadoresPage />} />
        <Route path="medicamentos" element={<AdminMedicamentosPage />} />
        <Route path="etiquetas" element={<AdminEtiquetasPage />} />
        <Route path="muestras" element={<Navigate to="/admin/cirujanos" replace />} />
        <Route path="especialidades" element={<AdminEspecialidadesPage />} />
        <Route path="plantillas" element={<AdminPlantillasPage />} />
        <Route path="poblar-datos" element={<AdminSeedPage />} />
      </Route>
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
