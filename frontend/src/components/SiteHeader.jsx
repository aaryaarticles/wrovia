import { Link } from "react-router-dom";

/**
 * SiteHeader — show only on Landing, Home, and Article pages.
 * Use anywhere: <SiteHeader />
 */
export default function SiteHeader() {
  return (
    <header className="home-header">
      <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
        <i className="fa-solid fa-feather"></i> Wrovia
      </Link>
    </header>
  );
}
