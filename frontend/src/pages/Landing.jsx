import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, getDeviceId, formatCount } from "../api.js";

export default function Landing() {
  const [webStats, setWebStats] = useState({ total: null, today: null });
  const [artStats, setArtStats] = useState({ count: null, views: null });

  useEffect(() => {
    // Track visitor
    api("/api/website/track", {
      method: "POST",
      body: JSON.stringify({ deviceId: getDeviceId() }),
    }).catch(() => {});

    // Fetch real visitor stats
    api("/api/website/stats")
      .then((d) => setWebStats({ total: d.total, today: d.today }))
      .catch(() => {});

    // Fetch real article count + total views
    api("/api/articles?all=true")
      .then((d) => {
        const arts = d.data || [];
        const totalViews = arts.reduce((s, a) => s + (a.views || 0), 0);
        setArtStats({ count: arts.length, views: totalViews });
      })
      .catch(() => {});
  }, []);

  const fmt = (n) => (n === null ? "..." : formatCount(n));

  return (
    <>
      <header className="landing-header">
        <div className="landing-logo">
          <i className="fa-solid fa-feather"></i> Wrovia
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <i className="fa-solid fa-sparkles"></i> Read · Think · Grow
          </div>
          <h1>
            Read Powerful Ideas.<br />
            <span>Improve Your Thinking.</span>
          </h1>
          <p>
            Modern articles on psychology, mindset, discipline, productivity,
            focus, and self-improvement — curated for sharp minds.
          </p>
          <Link to="/home" className="hero-btn">
            Read Articles <i className="fa-solid fa-arrow-right"></i>
          </Link>

          {/* Real stats — two cards side by side always */}
          <div className="stats">
            <div className="stat-card">
              <div className="stat-number">{fmt(webStats.total)}</div>
              <div className="stat-label">Total Visitors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{fmt(artStats.count)}</div>
              <div className="stat-label">Published Articles</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="fcard">
          <i className="fa-solid fa-brain"></i>
          <h3>Psychology</h3>
          <p>Deep dives into how your mind shapes your behaviour and decisions.</p>
        </div>
        <div className="fcard">
          <i className="fa-solid fa-bolt"></i>
          <h3>Productivity</h3>
          <p>Frameworks to do focused, meaningful work without burning out.</p>
        </div>
        <div className="fcard">
          <i className="fa-solid fa-mountain-sun"></i>
          <h3>Mindset</h3>
          <p>Stories and ideas that quietly rewire how you see the world.</p>
        </div>
        <div className="fcard">
          <i className="fa-solid fa-bullseye"></i>
          <h3>Discipline</h3>
          <p>Small daily systems that compound into a remarkable life.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/disclaimer">Disclaimer</Link>
          <Link to="/about">About</Link>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} Wrovia. All rights reserved.
        </div>
      </footer>
    </>
  );
}
