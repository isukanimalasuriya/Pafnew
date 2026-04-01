import { useEffect, useState } from 'react'
import DashboardPage from './components/DashboardPage'
import ResourcesPage from './components/ResourcesPage'
import Sidebar from './components/Sidebar'

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/')

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname || '/')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextRoute) => {
    if (nextRoute === route) return
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
  }

  return (
    <div className="font-poppins grid min-h-screen grid-cols-1 bg-slate-100 md:grid-cols-[250px_1fr]">
      <aside className="flex flex-col gap-3 bg-slate-900 p-5 md:p-6">
        <Sidebar route={route} onNavigate={navigate} />
      </aside>

      <main className="p-4 md:p-7">
        {route === '/resources' ? (
          <ResourcesPage />
        ) : (
          <DashboardPage onNavigate={navigate} />
        )}
      </main>
    </div>
  )
}

export default App
