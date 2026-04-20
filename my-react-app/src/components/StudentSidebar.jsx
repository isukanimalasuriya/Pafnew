import { useLocation, useNavigate } from "react-router-dom";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      {
        id: "student-dashboard",
        label: "Dashboard",
        path: "/student",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px]"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        id: "student-bookings",
        label: "My Bookings",
        path: "/student/bookings",
        badge: "3",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px]"
          >
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        id: "student-history",
        label: "History",
        path: "/student/history",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px]"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        id: "student-resources",
        label: "Resources",
        path: "/student/resources",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px]"
          >
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        id: "student-schedule",
        label: "Schedule",
        path: "/student/schedule",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px]"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
    ],
  },
];

const StudentSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`flex flex-col h-screen transition-all duration-200 shrink-0 ${
        collapsed ? "w-[64px]" : "w-[220px]"
      }`}
      style={{ background: "#1C1A2E" }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-2.5 px-3.5 py-[18px] border-b ${collapsed ? "justify-center px-2" : ""}`}
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #7C6FF7, #A78BFA)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <p
              className="text-[13px] font-semibold leading-tight"
              style={{ color: "#EEE" }}
            >
              SmartCampus
            </p>
            <p
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Student Portal
            </p>
          </div>
        )}

        <button
          onClick={onToggle}
          className={`${collapsed ? "" : "ml-auto"} w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0 transition-colors`}
          style={{ background: "rgba(255,255,255,0.06)", border: "none" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
            style={{ stroke: "rgba(255,255,255,0.4)" }}
          >
            <path d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5 flex flex-col gap-px">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="text-[9.5px] font-semibold uppercase tracking-widest mx-2 mt-3 mb-1"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-2.5 w-full rounded-[10px] text-left transition-colors relative ${
                    collapsed ? "justify-center p-2" : "px-2.5 py-[7px]"
                  }`}
                  style={{
                    background: isActive
                      ? "rgba(124,111,247,0.18)"
                      : "transparent",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Icon box */}
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                    style={{
                      background: isActive
                        ? "rgba(124,111,247,0.25)"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? "#A78BFA" : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {item.icon}
                    </span>
                  </div>

                  {!collapsed && (
                    <span
                      className="text-[13px] flex-1"
                      style={{
                        color: isActive ? "#C4B5FD" : "rgba(255,255,255,0.5)",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className="text-[10px] font-semibold rounded-full px-1.5 leading-4"
                      style={{ background: "#7C6FF7", color: "#fff" }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge && (
                    <span
                      className="absolute top-[7px] right-[7px] w-1.5 h-1.5 rounded-full"
                      style={{ background: "#7C6FF7" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div
        className={`px-3 py-3 border-t flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #7C6FF7, #A78BFA)" }}
        >
          KP
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p
              className="text-[12px] font-medium truncate"
              style={{ color: "#ddd" }}
            >
              Kasun Perera
            </p>
            <p
              className="text-[10.5px] truncate"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              kasun@student.lk
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default StudentSidebar;
