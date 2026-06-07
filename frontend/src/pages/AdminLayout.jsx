import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AdminLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api("/api/admin/check")
      .then((d) => { if (!d.loggedIn) nav("/login"); else setReady(true); })
      .catch(() => nav("/login"));
  }, [nav]);

  if (!ready) return <div className="loader">Loading...</div>;

  const items = [
    { to: "/admin",          end: true, icon: "fa-chart-pie",    label: "Dashboard" },
    { to: "/admin/create",             icon: "fa-pen-to-square", label: "Create"    },
    { to: "/admin/manage",             icon: "fa-list-check",    label: "Manage"    },
    { to: "/admin/settings",           icon: "fa-gear",          label: "Settings"  },
  ];

  return (
    <div className="admin-body">

      {/* ── TOP HEADER (mobile + desktop) ── */}
      <header className="admin-topbar">
        <div className="admin-logo">
          <i className="fa-solid fa-user-shield"></i>
          Admin<span>Panel</span>
        </div>

        {/* Desktop: nav links inline in header */}
        <nav className="admin-topbar-nav">
          {items.map((it) => (
            <NavLink
              key={it.to} to={it.to} end={it.end}
              className={({ isActive }) => "topbar-link" + (isActive ? " active" : "")}
            >
              <i className={"fa-solid " + it.icon}></i>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <nav className="mobile-nav">
        {items.map((it) => (
          <NavLink
            key={it.to} to={it.to} end={it.end}
            className={({ isActive }) => "mobile-item" + (isActive ? " active" : "")}
          >
            <i className={"fa-solid " + it.icon}></i>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
