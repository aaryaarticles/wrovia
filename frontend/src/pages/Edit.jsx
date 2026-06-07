import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadImage } from "../api.js";

export default function Edit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api(`/api/articles/${id}`).then((d) => {
      const a = d.data;
      setF({
        title: a.title, desc: a.desc, content: a.content,
        category: a.category, tags: (a.tags || []).join(", "),
        imageUrl: a.image?.url || "", imagePublicId: a.image?.public_id || "",
      });
    });
  }, [id]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("Uploading image...");
    setMsgType("info");
    try {
      const r = await uploadImage(file);
      setF((s) => ({ ...s, imageUrl: r.url, imagePublicId: r.public_id }));
      setMsg("Image updated successfully ✓");
      setMsgType("success");
    } catch (e) {
      setMsg(e.message);
      setMsgType("error");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api(`/api/articles/${id}`, { method: "PUT", body: JSON.stringify(f) });
      nav("/admin/manage");
    } catch (e) {
      setMsg(e.message);
      setMsgType("error");
    } finally {
      setBusy(false);
    }
  };

  if (!f) return (
    <div className="edit-loading">
      <div className="edit-spinner"></div>
      <p>Loading article...</p>
    </div>
  );

  const categories = ["lifestyle", "psychology", "education", "technology", "story"];

  return (
    <div className="edit-page">
      {/* Header */}
      <div className="edit-header">
        <div className="edit-header-left">
          <button className="edit-back-btn" onClick={() => nav("/admin/manage")}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="edit-title">Edit Article</h1>
            <p className="edit-subtitle">Make changes and save to update</p>
          </div>
        </div>
        <button className="edit-save-btn" onClick={submit} disabled={busy || uploading}>
          {busy ? (
            <><span className="btn-spinner"></span> Saving...</>
          ) : (
            <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
          )}
        </button>
      </div>

      {msg && (
        <div className={`edit-alert edit-alert-${msgType}`}>
          <i className={`fa-solid ${msgType === "success" ? "fa-circle-check" : msgType === "error" ? "fa-circle-exclamation" : "fa-circle-info"}`}></i>
          {msg}
        </div>
      )}

      <div className="edit-grid">
        {/* Left column — main content */}
        <div className="edit-main-col">

          {/* Title & Description */}
          <div className="edit-card">
            <div className="edit-card-header">
              <i className="fa-solid fa-pen-nib"></i>
              <span>Article Info</span>
            </div>
            <div className="edit-field">
              <label>Title <span className="req">*</span></label>
              <input
                className="edit-input"
                placeholder="Enter article title..."
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </div>
            <div className="edit-field">
              <label>Description</label>
              <textarea
                className="edit-input edit-textarea-sm"
                placeholder="Brief description of your article..."
                value={f.desc}
                onChange={(e) => setF({ ...f, desc: e.target.value })}
              />
            </div>
          </div>

          {/* Content */}
          <div className="edit-card">
            <div className="edit-card-header">
              <i className="fa-solid fa-align-left"></i>
              <span>Content</span>
            </div>
            <div className="edit-field">
              <label>Article Body <span className="req">*</span></label>
              <textarea
                className="edit-input edit-textarea-lg"
                placeholder="Write your article content here..."
                value={f.content}
                onChange={(e) => setF({ ...f, content: e.target.value })}
              />
            </div>
          </div>

        </div>

        {/* Right column — meta */}
        <div className="edit-side-col">

          {/* Cover image */}
          <div className="edit-card">
            <div className="edit-card-header">
              <i className="fa-solid fa-image"></i>
              <span>Cover Image</span>
            </div>
            {f.imageUrl && (
              <div className="edit-img-preview-wrap">
                <img src={f.imageUrl} alt="Cover" className="edit-img-preview" />
                <div className="edit-img-overlay">
                  <i className="fa-solid fa-camera"></i>
                  <span>Change Image</span>
                </div>
                <label className="edit-img-click-zone">
                  <input type="file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
                </label>
              </div>
            )}
            {!f.imageUrl && (
              <label className={`edit-upload-zone ${uploading ? "uploading" : ""}`}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>{uploading ? "Uploading..." : "Click to upload image"}</p>
                <small>PNG, JPG, WebP supported</small>
                <input type="file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
              </label>
            )}
            {f.imageUrl && (
              <label className={`edit-replace-btn ${uploading ? "uploading" : ""}`}>
                <i className="fa-solid fa-arrows-rotate"></i>
                {uploading ? "Uploading..." : "Replace Image"}
                <input type="file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="edit-card">
            <div className="edit-card-header">
              <i className="fa-solid fa-folder-open"></i>
              <span>Category & Tags</span>
            </div>
            <div className="edit-field">
              <label>Category</label>
              <div className="edit-cat-grid">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`edit-cat-pill ${f.category === cat ? "active" : ""}`}
                    onClick={() => setF({ ...f, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="edit-field">
              <label>Tags <small style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(comma separated)</small></label>
              <input
                className="edit-input"
                placeholder="e.g. health, mindset, tips"
                value={f.tags}
                onChange={(e) => setF({ ...f, tags: e.target.value })}
              />
            </div>
          </div>

          {/* Save button mobile */}
          <button className="edit-save-btn edit-save-mobile" onClick={submit} disabled={busy || uploading}>
            {busy ? (
              <><span className="btn-spinner"></span> Saving...</>
            ) : (
              <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
