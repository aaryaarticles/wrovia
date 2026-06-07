// Production mein VITE_API_BASE = backend ka full URL set karo Render pe
// Local development mein empty string rahega (proxy use hoga)
const BASE = import.meta.env.VITE_API_BASE || "";

export function getDeviceId() {
  let id = localStorage.getItem("_did");
  if (!id) {
    id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("_did", id);
  }
  return id;
}

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");
  return data;
}

export function formatCount(n) {
  if (!n || n < 1000) return String(n || 0);
  if (n < 1000000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return (n / 1000000).toFixed(1) + "M";
}

export function timeAgo(d) {
  if (!d) return "Recently";
  const past = new Date(d);
  if (isNaN(past.getTime())) return "Recently";
  const diff = Math.floor((Date.now() - past) / 1000);
  if (diff < 60) return "Just now";
  const mins = Math.floor(diff / 60);
  if (diff < 3600) return mins === 1 ? "1 minute ago" : mins + " minutes ago";
  const hrs = Math.floor(diff / 3600);
  if (diff < 86400) return hrs === 1 ? "1 hour ago" : hrs + " hours ago";
  const days = Math.floor(diff / 86400);
  if (diff < 2592000) return days === 1 ? "1 day ago" : days + " days ago";
  const mos = Math.floor(diff / 2592000);
  if (diff < 31536000) return mos === 1 ? "1 month ago" : mos + " months ago";
  const yrs = Math.floor(diff / 31536000);
  return yrs === 1 ? "1 year ago" : yrs + " years ago";
}
