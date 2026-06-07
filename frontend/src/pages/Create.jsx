import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, uploadImage } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";

export default function Create() {
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", desc: "", content: "", category: "", imageUrl: "", imagePublicId: "" });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [imgStatus, setImgStatus] = useState("idle");
  const [imgProgress, setImgProgress] = useState(0);
  const tagRef = useRef(null);

  const imageReady = imgStatus === "success";
  const canPublish = f.title && f.desc && f.content && f.category && imageReady;

  const addTag = () => {
    const val = tagInput.trim().replace(/^#+/, "");
    if (!val) return;
    const newTags = val.split(",").map(t => t.trim()).filter(t => t && !tags.includes(t));
    if (newTags.length) setTags(prev => [...prev, ...newTags]);
    setTagInput("");
    tagRef.current?.focus();
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const onTagKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags(prev => prev.slice(0, -1));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImgStatus("uploading"); setImgProgress(0); setMsg("");
    const prog = setInterval(() => setImgProgress((p) => Math.min(p + 15, 85)), 200);
    try {
      const r = await uploadImage(file);
      clearInterval(prog); setImgProgress(100);
      setF((s) => ({ ...s, imageUrl: r.url, imagePublicId: r.public_id }));
      setImgStatus("success");
    } catch (e) {
      clearInterval(prog); setImgStatus("error");
      setMsg("Image upload failed: " + e.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canPublish) return;
    setBusy(true); setMsg("");
    try {
      await api("/api/articles", { method: "POST", body: JSON.stringify({ ...f, tags }) });
      nav("/admin/manage");
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };

  const previewArticle = {
    title: f.title,
    desc: f.desc,
    category: f.category,
    image: f.imageUrl ? { url: f.imageUrl } : null,
    views: 0,
    likes: 0,
  };

  return (
    <div className="create-layout">

      {/* ── TOP: Live Preview (always first / top) ── */}
      <div className="create-preview-top">
        <div className="preview-header"><i className="fa-solid fa-eye"></i> Live Preview</div>
        <p className="preview-subhead">Exactly as it will appear on the home page</p>
        <ArticleCard article={previewArticle} preview={true} />
        {f.content && (
          <div className="preview-content-snippet">
            <div className="preview-content-label"><i className="fa-solid fa-align-left"></i> Content Preview</div>
            <p>{f.content.slice(0, 300)}{f.content.length > 300 ? "..." : ""}</p>
          </div>
        )}

        {/* Image Upload — right below the preview */}
        <div className="form-section" style={{ marginTop: 16 }}>
          <div className="section-label"><i className="fa-solid fa-image"></i> Cover Image *</div>
          {imgStatus === "uploading" && (
            <div className="upload-linear-wrap">
              <p className="upload-linear-text"><i className="fa-solid fa-spinner fa-spin"></i> Uploading... {imgProgress}%</p>
              <div className="upload-linear-bar">
                <div className="upload-linear-fill" style={{ width: imgProgress + "%" }}></div>
              </div>
            </div>
          )}
          {imgStatus !== "uploading" && (
            <label className={"upload-btn-label" + (imgStatus === "success" ? " upload-btn-success" : imgStatus === "error" ? " upload-btn-error" : "")}>
              {imgStatus === "idle"    && <><i className="fa-solid fa-cloud-arrow-up"></i> Upload Image</>}
              {imgStatus === "success" && <><i className="fa-solid fa-circle-check"></i> Uploaded — Change</>}
              {imgStatus === "error"   && <><i className="fa-solid fa-triangle-exclamation"></i> Failed — Retry</>}
              <input type="file" accept="image/*" hidden onChange={onFile} disabled={imgStatus === "uploading"} />
            </label>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Form ── */}
      <div className="create-form-col">
        <h1>Create Article</h1>
        <p className="subtitle">Write a new article and publish it.</p>
        <form onSubmit={submit}>

          {/* Basic Info */}
          <div className="form-section">
            <div className="section-label"><i className="fa-solid fa-circle-info"></i> Basic Info</div>
            <div className="field-group">
              <label>Title *</label>
              <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Article title..." />
            </div>
            <div className="field-group">
              <label>Description *</label>
              <input required value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="Short description..." />
            </div>
            <div className="field-group">
              <label>Category *</label>
              <select required value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                <option value="">Select Category</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="psychology">Psychology</option>
                <option value="education">Education</option>
                <option value="technology">Technology</option>
                <option value="story">Story</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <div className="section-label"><i className="fa-solid fa-tags"></i> Tags</div>
            <div className="tag-input-row">
              <input
                ref={tagRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="Type a tag... (add with Enter or comma)"
                className="tag-text-input"
              />
              <button type="button" className="tag-add-btn" onClick={addTag}>
                <i className="fa-solid fa-plus"></i> Add
              </button>
            </div>
            {tags.length > 0 ? (
              <div className="tag-preview-box">
                {tags.map((t) => (
                  <span key={t} className="tag-chip">
                    #{t}
                    <button type="button" className="tag-chip-remove" onClick={() => removeTag(t)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="tag-preview-empty"><i className="fa-solid fa-tag"></i> Tags will appear here...</div>
            )}
            <p className="tag-hint">
              <i className="fa-solid fa-circle-info"></i> Separate multiple tags with commas — e.g.: <em>growth, focus, mindset</em>
            </p>
          </div>

          {/* Content */}
          <div className="form-section">
            <div className="section-label"><i className="fa-solid fa-align-left"></i> Content *</div>
            <div className="field-group">
              <textarea required value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Write your full article content here..." />
            </div>
          </div>

          {msg && <p style={{ color: imgStatus === "error" ? "#f87171" : "#94a3b8", marginBottom: 12 }}>{msg}</p>}
          {!imageReady && (
            <p className="publish-hint"><i className="fa-solid fa-lock"></i> Publish button will become active after image is uploaded</p>
          )}
          <button className="publish-btn" type="submit" disabled={busy || !canPublish}>
            {busy ? "Publishing..." : !imageReady
              ? <><i className="fa-solid fa-lock"></i> Upload Image to Publish</>
              : <><i className="fa-solid fa-paper-plane"></i> Publish Article</>}
          </button>
        </form>
      </div>
    </div>
  );
}
