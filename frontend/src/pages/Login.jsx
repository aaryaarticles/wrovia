import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Login() {
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [remember, setR] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/admin/check").then((d) => { if (d.loggedIn) nav("/admin"); }).catch(() => {});
    const saved = localStorage.getItem("admin_remember");
    if (saved) {
      try { const o = JSON.parse(saved); setU(o.u || ""); setP(o.p || ""); } catch {}
    }
  }, [nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
      if (remember) localStorage.setItem("admin_remember", JSON.stringify({ u: username, p: password }));
      else localStorage.removeItem("admin_remember");
      nav("/admin");
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-icon"><i className="fa-solid fa-user-shield"></i></div>
        <h2>Admin <span>Login</span></h2>
        <p className="sub">Welcome back. Login to your dashboard.</p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group"><label>Username</label>
            <input value={username} onChange={(e) => setU(e.target.value)} required autoFocus /></div>
          <div className="form-group"><label>Password</label>
            <input type="password" value={password} onChange={(e) => setP(e.target.value)} required /></div>
          <div className="remember-row">
            <label><input type="checkbox" checked={remember} onChange={(e) => setR(e.target.checked)} /> Remember me</label>
          </div>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : <><i className="fa-solid fa-right-to-bracket"></i> Login</>}
          </button>
        </form>
      </div>
    </div>
  );
}
