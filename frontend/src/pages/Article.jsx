import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import { api, getDeviceId, timeAgo, formatCount } from "../api.js";

export default function ArticlePage() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    api(`/api/articles/${id}`).then((d) => {
      setA(d.data);
      setLikes(d.data.likes || 0);
      setViews(d.data.views || 0);
      setLiked(d.data.likedBy?.includes(getDeviceId()));
      api(`/api/articles/${id}/view`, { method: "POST", body: JSON.stringify({ deviceId: getDeviceId() }) })
        .then((v) => { if (v?.views !== undefined) setViews(v.views); })
        .catch(() => {});
    }).catch((e) => setErr(e.message));
  }, [id]);

  const toggleLike = async () => {
    try {
      const d = await api(`/api/articles/${id}/like`, { method: "POST", body: JSON.stringify({ deviceId: getDeviceId() }) });
      setLikes(d.likes); setLiked(d.liked);
    } catch {}
  };

  if (err) return (
    <>
      <SiteHeader />
      <div className="article-wrap">
        <Link to="/home" className="article-back"><i className="fa-solid fa-arrow-left"></i> Back to feed</Link>
        <p style={{ color: "#f87171" }}>{err}</p>
      </div>
    </>
  );

  if (!a) return <div className="loader">Loading…</div>;

  return (
    <>
      {/* 1. Header */}
      <SiteHeader />

      <div className="article-wrap">

        {/* 2. Back button */}
        <Link to="/home" className="article-back"><i className="fa-solid fa-arrow-left"></i> Back to feed</Link>

        {/* 3. Cover image */}
        {a.image?.url && <img className="article-cover" src={a.image.url} alt="" />}

        {/* 4. Title */}
        <h1 className="article-title">{a.title}</h1>

        {/* 5. Category + Tags — one line */}
        <div className="article-cat-tags-row">
          {a.category && <span className="article-category-badge">{a.category}</span>}
          {a.tags?.map((t) => <span key={t} className="tag-pill">#{t}</span>)}
        </div>

        {/* 6. Likes · Views · Publish time — one line */}
        <div className="article-meta-row">
          <button className={"article-like-btn" + (liked ? " liked" : "")} onClick={toggleLike}>
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            <strong>{formatCount(likes)}</strong>
          </button>
          <span className="article-meta-stat">
            <i className="fa-regular fa-eye"></i>
            <strong>{formatCount(views)}</strong>
          </span>
          <span className="article-meta-stat">
            <i className="fa-regular fa-calendar-days"></i>
            {timeAgo(a.createdAt || a.date)}
          </span>
        </div>

        {/* 7. Description */}
        {a.desc && <p className="article-desc">{a.desc}</p>}

        {/* 8. Full content */}
        <div className="article-content">{a.content}</div>
      </div>
    </>
  );
}
