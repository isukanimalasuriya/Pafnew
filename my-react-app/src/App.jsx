import { useMemo } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import DashboardPage from './components/DashboardPage'
import ResourcesPage from './components/ResourcesPage'
import NotificationBell from './components/NotificationBell'
import BookingsPage from './components/BookingsPage'
import AdminBookingsPage from './components/AdminBookingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OAuth2RedirectPage from './pages/OAuth2RedirectPage'
import AdminUsersPage from './pages/AdminUsersPage'
import { useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const route = useMemo(() => location.pathname || '/', [location.pathname])

  const handleNavigate = (nextRoute) => {
    if (nextRoute === route) return
    navigate(nextRoute)
  }

  return (
    <>
      <Toaster />
      <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <div className="font-poppins grid min-h-screen grid-cols-1 bg-slate-100 md:grid-cols-[250px_1fr]">
              <aside className="sticky top-0 h-screen flex flex-col gap-6 bg-slate-900 p-5 md:p-6 overflow-hidden">
                <Sidebar user={user} logout={logout} route={route} onNavigate={handleNavigate} />
              </aside>

              <main className="p-5 md:p-8">
                <div className="mb-5 flex items-center justify-end">
                  <NotificationBell />
                </div>
                <Routes>
                  <Route path="/" element={<DashboardPage onNavigate={handleNavigate} />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                  {/* Role-protected routes */}
                  <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminUsersPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredRoles={['TECHNICIAN', 'ADMIN']} />}>
                    <Route path="/maintenance" element={<div>Maintenance Dashboard</div>} />
                  </Route>
                </Routes>
              </main>
            </div>
          }
        />
      </Route>
    </Routes>
    </>
  )
}

export default App;
