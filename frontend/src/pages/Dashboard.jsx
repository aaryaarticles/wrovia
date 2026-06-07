import { useEffect, useState } from "react";
import { api, timeAgo, formatCount } from "../api.js";

export default function Dashboard() {
  const [arts, setArts] = useState([]);
  const [stats, setStats] = useState({});
  const [web, setWeb] = useState({});

  useEffect(() => {
    api("/api/articles?all=true").then((d) => setArts(d.data || []));
    api("/api/articles-stats").then(setStats).catch(() => {});
    api("/api/website/stats").then(setWeb).catch(() => {});
  }, []);

  const fmt = (n) => formatCount(n || 0);

  // Today filter helper
  const isToday = (dateStr) => {
    const d = new Date(dateStr), now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const todayArts = arts.filter((a) => isToday(a.createdAt));
  const todayViews = arts.reduce((s, a) => s + (a.todayViews || 0), 0); // if backend sends todayViews per article
  const todayLikes = arts.reduce((s, a) => s + (a.todayLikes || 0), 0);

  // Row 1: Visitors
  const row1 = [
    { label: "Total Visitors",   num: fmt(web.total),        icon: "fa-users",       color: "cyan"   },
    { label: "Today Visitors",   num: fmt(web.today),        icon: "fa-chart-line",  color: "orange" },
  ];
  // Row 2: Articles
  const row2 = [
    { label: "Total Articles",   num: fmt(arts.length),      icon: "fa-newspaper",        color: "blue"  },
    { label: "Today Articles",   num: fmt(todayArts.length), icon: "fa-file-circle-plus", color: "green" },
  ];
  // Row 3: Views — Total + Today
  const row3 = [
    { label: "Total Views",      num: fmt(stats.totalViews ?? arts.reduce((s,a)=>s+(a.views||0),0)), icon: "fa-eye",    color: "purple" },
    { label: "Today Views",      num: fmt(stats.todayViews ?? todayViews),                           icon: "fa-eye",    color: "indigo" },
  ];
  // Row 4: Likes — Total + Today
  const row4 = [
    { label: "Total Likes",      num: fmt(stats.totalLikes ?? arts.reduce((s,a)=>s+(a.likes||0),0)), icon: "fa-heart", color: "pink"   },
    { label: "Today Likes",      num: fmt(stats.todayLikes ?? todayLikes),                            icon: "fa-heart", color: "rose"   },
  ];

  const StatCard = ({ c }) => (
    <div className="dash-card">
      <div>
        <h3>{c.label}</h3>
        <p className="num">{c.num}</p>
      </div>
      <div className={"icon " + c.color}><i className={"fa-solid " + c.icon}></i></div>
    </div>
  );

  // Top 5 by views
  const topViewed = [...arts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  // Latest 5
  const latest = [...arts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const ArticleTable = ({ items }) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Image</th><th>Title</th><th>Category</th>
            <th>Views</th><th>Likes</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a._id}>
              <td><img className="thumb-sm" src={a.image?.url} alt="" /></td>
              <td>
                <strong>{a.title}</strong><br />
                <small style={{ color: "#64748b" }}>{timeAgo(a.createdAt)}</small>
              </td>
              <td><span className="badge">{a.category}</span></td>
              <td>{formatCount(a.views || 0)}</td>
              <td>{formatCount(a.likes || 0)}</td>
              <td>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No articles yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <h1>Dashboard</h1>
      <p className="subtitle">Overview of your articles and visitors.</p>

      {/* Visitors */}
      <div className="dash-section-label"><i className="fa-solid fa-users"></i> Visitors</div>
      <div className="stats-grid stats-grid-2">
        {row1.map(c => <StatCard key={c.label} c={c} />)}
      </div>

      {/* Articles */}
      <div className="dash-section-label"><i className="fa-solid fa-newspaper"></i> Articles</div>
      <div className="stats-grid stats-grid-2">
        {row2.map(c => <StatCard key={c.label} c={c} />)}
      </div>

      {/* Views */}
      <div className="dash-section-label"><i className="fa-solid fa-eye"></i> Views</div>
      <div className="stats-grid stats-grid-2">
        {row3.map(c => <StatCard key={c.label} c={c} />)}
      </div>

      {/* Likes */}
      <div className="dash-section-label"><i className="fa-solid fa-heart"></i> Likes</div>
      <div className="stats-grid stats-grid-2">
        {row4.map(c => <StatCard key={c.label} c={c} />)}
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>
        <i className="fa-solid fa-clock-rotate-left"></i> Latest Articles
      </div>
      <ArticleTable items={latest} />

      <div className="section-title" style={{ marginTop: 36 }}>
        <i className="fa-solid fa-fire"></i> Top Viewed Articles
      </div>
      <ArticleTable items={topViewed} />
    </>
  );
}
