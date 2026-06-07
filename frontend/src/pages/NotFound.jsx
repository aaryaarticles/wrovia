import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="notfound">
      <div><h1>404</h1><p>This page does not exist.</p>
        <Link to="/" className="hero-btn"><i className="fa-solid fa-house"></i> Go Home</Link></div>
    </div>
  );
}
