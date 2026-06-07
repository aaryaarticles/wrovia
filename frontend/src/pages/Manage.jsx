import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, timeAgo } from "../api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Manage() {
  const [arts, setArts] = useState([]);
  const [modal, setModal] = useState({ open: false, id: null, title: "" });

  const load = () => api("/api/articles?all=true").then((d) => setArts(d.data || []));
  useEffect(() => { load(); }, []);

  const askDelete = (id, title) => setModal({ open: true, id, title });

  const confirmDelete = async () => {
    const { id } = modal;
    setModal({ open: false, id: null, title: "" });
    try {
      await api(`/api/articles/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setModal({ open: true, id: null, title: "", isAlert: true, alertMsg: e.message });
    }
  };

  return (
    <>
      <h1>Manage Articles</h1>
      <p className="subtitle">Edit or delete articles.</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Image</th><th>Title</th><th>Category</th>
              <th>Views</th><th>Likes</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {arts.map((a) => (
              <tr key={a._id}>
                <td><img className="thumb-sm" src={a.image?.url} alt="" /></td>
                <td>
                  <strong>{a.title}</strong><br />
                  <small style={{ color: "#64748b" }}>{timeAgo(a.createdAt)}</small>
                </td>
                <td><span className="badge">{a.category}</span></td>
                <td>{a.views || 0}</td>
                <td>{a.likes || 0}</td>
                <td>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <Link to={`/admin/edit/${a._id}`} className="btn-link">Edit</Link>
                  <button className="btn-danger" onClick={() => askDelete(a._id, a.title)}>Delete</button>
                </td>
              </tr>
            ))}
            {arts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                  No articles yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={modal.open && !modal.isAlert}
        type="danger"
        title="Delete Article?"
        message={modal.title ? `"${modal.title}" will be permanently deleted. This cannot be undone.` : "This article will be permanently deleted."}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, id: null, title: "" })}
      />

      {/* Error alert modal */}
      <ConfirmModal
        open={!!modal.isAlert}
        type="alert"
        title="Error"
        message={modal.alertMsg}
        confirmLabel="OK"
        onConfirm={() => setModal({ open: false, id: null, title: "" })}
        onCancel={() => setModal({ open: false, id: null, title: "" })}
      />
    </>
  );
}
