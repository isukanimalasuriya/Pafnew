import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/DashboardPage";
import ResourcesPage from "./components/ResourcesPage";
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";
import TicketList from "./pages/TicketList";
//import BookingsPage from "./components/BookingsPage";

function PlaceholderPage({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-xl font-medium text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mb-4">{subtitle}</p>
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl ring-1 ring-slate-200">
        <p className="text-slate-400 text-sm">Content coming soon</p>
      </div>
    </div>
  );
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 font-poppins">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <main className="flex-1 overflow-y-auto p-5">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />

          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                subtitle="Insights coming soon"
              />
            }
          />

          <Route
            path="/students"
            element={
              <PlaceholderPage title="Students" subtitle="Manage students" />
            }
          />

          <Route
            path="/settings"
            element={
              <PlaceholderPage title="Settings" subtitle="System settings" />
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
