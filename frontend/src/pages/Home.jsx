import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

const CATEGORIES = ["All", "Lifestyle", "Psychology", "Education", "Technology", "Story"];
const PAGE_SIZE = 10;

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    api("/api/articles?all=true")
      .then((d) => setAllArticles(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [q, activeCategory]);

  const filtered = allArticles.filter((a) => {
    const s = q.toLowerCase();
    const matchSearch =
      !s ||
      a.title?.toLowerCase().includes(s) ||
      a.desc?.toLowerCase().includes(s) ||
      a.category?.toLowerCase().includes(s);
    const matchCat =
      activeCategory === "All" ||
      a.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const availableCategories = CATEGORIES.filter((cat) => {
    if (cat === "All") return true;
    return allArticles.some((a) => {
      const s = q.toLowerCase();
      const matchSearch =
        !s ||
        a.title?.toLowerCase().includes(s) ||
        a.desc?.toLowerCase().includes(s) ||
        a.category?.toLowerCase().includes(s);
      return matchSearch && a.category?.toLowerCase() === cat.toLowerCase();
    });
  });

  return (
    <>
      <SiteHeader />

      <section className="search-section">
        <div className={"search-box" + (q ? " has-text" : "")}>
          <span className="search-icon">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles..."
          />
          <span className="clear-btn" onClick={() => setQ("")}>
            <i className="fa-solid fa-xmark"></i>
          </span>
        </div>
      </section>

      <h1 className="page-title">Explore Powerful Articles</h1>

      {!loading && (
        <div className="category-filter">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              className={"cat-btn" + (activeCategory === cat ? " active" : "")}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loader">
          <i className="fa-solid fa-spinner fa-spin"></i> Loading...
        </div>
      ) : (
        <main className="grid">
          {visible.length === 0 && (
            <p style={{ color: "#64748b", textAlign: "center", gridColumn: "1/-1" }}>
              No articles found
            </p>
          )}
          {visible.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </main>
      )}

      <div
        ref={loaderRef}
        style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {loadingMore && (
          <div className="loader" style={{ padding: "10px 0" }}>
            <i className="fa-solid fa-spinner fa-spin"></i> Loading more...
          </div>
        )}
        {!loading && !hasMore && filtered.length > 0 && (
          <p style={{ color: "#475569", fontSize: 13, padding: "10px 0 30px" }}>
            You've read everything 🎉
          </p>
        )}
      </div>
    </>
  );
}
