import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

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

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
