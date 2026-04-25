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
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";
import TicketList from "./pages/TicketList";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SchedulePage from "./pages/SchedulePage";
import { useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const route = useMemo(() => location.pathname || "/", [location.pathname]);

  const handleNavigate = (nextRoute) => {
    if (nextRoute === route) return;
    navigate(nextRoute);
  };

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
                  {/* Notification Bell moved to FAB */}
                  <Routes>
                    <Route path="/" element={<DashboardPage onNavigate={handleNavigate} />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route element={<ProtectedRoute requiredRoles={["ADMIN"]} />}>
                      <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                    </Route>
                    <Route path="/tickets" element={<TicketList />} />
                    <Route path="/tickets/new" element={<CreateTicket />} />
                    <Route path="/tickets/:id" element={<TicketDetail />} />
                    
                    {/* Role-protected routes */}
                    <Route element={<ProtectedRoute requiredRoles={["ADMIN"]} />}>
                      <Route path="/admin" element={<AdminUsersPage />} />
                    </Route>
                    <Route element={<ProtectedRoute requiredRoles={["TECHNICIAN", "ADMIN"]} />}>
                      <Route path="/maintenance" element={<MaintenanceDashboard />} />
                    </Route>
                    <Route element={<ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]} />}>
                      <Route path="/manager" element={<ManagerDashboard />} />
                    </Route>
                  </Routes>
                </main>

                {/* Floating Notification Bell */}
                <div className="fixed bottom-6 right-6 z-50">
                  <NotificationBell />
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  )
}

export default App;
