import { Link } from "react-router-dom";
import { timeAgo, formatCount } from "../api.js";

export default function ArticleCard({ article, preview = false }) {
  const {
    _id,
    title,
    desc,
    image,
    views = 0,
    likes = 0,
    createdAt,
  } = article;

  const thumb = image?.url || null;

  const inner = (
    <div className="acard-inner">
      {/* Left: image — fixed square */}
      <div className="acard-thumb-wrap">
        {thumb ? (
          <img className="thumb" src={thumb} alt="" />
        ) : (
          <div className="thumb thumb-placeholder">
            <i className="fa-solid fa-image"></i>
          </div>
        )}
      </div>

      {/* Right: content with footer pinned to bottom */}
      <div className="acard-body">
        <div className="acard-body-top">
          <h3 className="acard-title">
            {title || <span className="acard-placeholder">Article title will appear here</span>}
          </h3>
          <p className="desc">
            {desc || <span className="acard-placeholder">Description will appear here...</span>}
          </p>
        </div>

        {/* Stats — always at bottom of card */}
        <div className="acard-footer">
          <span className="acard-stat">
            <i className="fa-solid fa-heart" style={{ color: "#f87171" }}></i>
            {formatCount(likes)}
          </span>
          <span className="acard-stat">
            <i className="fa-regular fa-eye"></i>
            {formatCount(views)}
          </span>
          <span className="acard-stat acard-date">
            <i className="fa-regular fa-clock"></i>
            {preview ? "Just now" : timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

  if (preview) {
    return <div className="acard acard-preview">{inner}</div>;
  }

  return (
    <Link to={`/article/${_id}`} className="acard">
      {inner}
    </Link>
  );
}
