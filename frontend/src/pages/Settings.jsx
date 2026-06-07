import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

// Which panel is open: null | "password" | "logout" | "devices"
export default function Settings() {
  const nav = useNavigate();
  const [panel, setPanel] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Modal state: { open, type, title, message, onConfirm }
  const [modal, setModal] = useState({ open: false });

  const closeModal = () => setModal({ open: false });

  const showConfirm = (title, message, onConfirm, type = "confirm") =>
    setModal({ open: true, type, title, message, onConfirm });

  const showAlert = (title, message) =>
    setModal({ open: true, type: "alert", title, message, onConfirm: closeModal });

  const loadSessions = () =>
    api("/api/admin/sessions").then((d) => {
      setSessions(d.sessions || []);
      setCurrentId(d.currentSessionId || "");
    });

  const openPanel = (name) => {
    setPanel(p => p === name ? null : name);
    setMsg(""); setErr("");
    if (name === "devices") loadSessions();
  };

  const revoke = (sid) => {
    showConfirm(
      "Logout Device?",
      "This device will be remotely logged out immediately.",
      async () => {
        closeModal();
        try {
          await api("/api/admin/sessions/revoke", {
            method: "POST",
            body: JSON.stringify({ sessionId: sid }),
          });
          loadSessions();
        } catch (e) {
          showAlert("Error", e.message);
        }
      },
      "danger"
    );
  };

  const changePw = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    if (pw.next !== pw.confirm) return setErr("New password does not match.");
    try {
      await api("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      setMsg("Password updated successfully ✓");
      setPw({ current: "", next: "", confirm: "" });
      localStorage.removeItem("admin_remember");
    } catch (e) { setErr(e.message); }
  };

  const logout = () => {
    showConfirm(
      "Logout?",
      "You will be logged out of the admin panel.",
      async () => {
        closeModal();
        await api("/api/admin/logout", { method: "POST" }).catch(() => {});
        nav("/login");
      },
      "danger"
    );
  };

  return (
    <>
      <h1>Settings</h1>
      <p className="subtitle">Manage your account.</p>

      {/* ── Button list ── */}
      <div className="settings-btn-list">

        {/* Change Password */}
        <button className={"settings-action-btn" + (panel === "password" ? " active" : "")} onClick={() => openPanel("password")}>
          <i className="fa-solid fa-key"></i>
          <span>Change Password</span>
          <i className={"fa-solid fa-chevron-" + (panel === "password" ? "up" : "down") + " settings-chevron"}></i>
        </button>

        {panel === "password" && (
          <div className="settings-panel">
            <form onSubmit={changePw} className="form-section" style={{ marginBottom: 0 }}>
              {err && <div className="error-msg">{err}</div>}
              {msg && <div className="success-msg">{msg}</div>}
              <div className="field-group">
                <label>Current Password</label>
                <input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </div>
              <div className="field-group">
                <label>New Password</label>
                <input type="password" required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Confirm New Password</label>
                <input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </div>
              <button className="publish-btn"><i className="fa-solid fa-lock"></i> Update Password</button>
            </form>
          </div>
        )}

        {/* Logout */}
        <button className="settings-action-btn settings-logout-btn" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
          <i className="fa-solid fa-arrow-right settings-chevron"></i>
        </button>

        {/* Login Devices */}
        <button className={"settings-action-btn" + (panel === "devices" ? " active" : "")} onClick={() => openPanel("devices")}>
          <i className="fa-solid fa-mobile-screen"></i>
          <span>Login Devices</span>
          <i className={"fa-solid fa-chevron-" + (panel === "devices" ? "up" : "down") + " settings-chevron"}></i>
        </button>

        {panel === "devices" && (
          <div className="settings-panel">
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
              All devices where admin is logged in will appear here with their IP. You can remotely logout other devices.
            </p>
            {sessions.length === 0 && <p className="loader">No sessions found.</p>}
            {sessions.map((s) => (
              <div key={s.sessionId} className="session-card">
                <div>
                  <div className="device">
                    <i className="fa-solid fa-desktop"></i> {s.device}
                    {s.isCurrent && <span className="current-pill">This device</span>}
                  </div>
                  <div className="meta">IP: <span className="ip">{s.ip || "unknown"}</span></div>
                  <div className="meta">Last seen: {new Date(s.lastSeen).toLocaleString("en-IN")}</div>
                </div>
                {!s.isCurrent && (
                  <button className="btn-danger" onClick={() => revoke(s.sessionId)}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      <ConfirmModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    </>
  );
}
