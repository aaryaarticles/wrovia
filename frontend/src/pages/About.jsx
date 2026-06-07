import { Link } from "react-router-dom";
export default function About() {
  return (
    <div className="legal-wrap">
      <div className="legal-card">
        <Link to="/" className="legal-back"><i className="fa-solid fa-arrow-left"></i> Home</Link>
        <h1><i className="fa-solid fa-feather"></i> About Wrovia</h1>
        <div className="legal-content">
          <h2>Our Mission</h2>
          <p>Wrovia is a curated reading space for people who want to think better, live intentionally, and grow continuously. We publish in-depth articles on psychology, mindset, discipline, productivity, and self-improvement.</p>
          <h2>What We Write About</h2>
          <p>We focus on ideas that are both intellectually stimulating and practically useful. Our articles draw on psychology research, philosophy, and real-world frameworks to help readers understand themselves and the world more clearly.</p>
          <h2>Our Values</h2>
          <p><strong>Depth over breadth</strong> — We prefer one well-crafted piece over ten shallow ones.<br/><strong>No fluff</strong> — Every sentence earns its place.<br/><strong>Reader-first</strong> — No ads, no clickbait, no distractions.</p>
          <h2>Contact</h2>
          <p>Have a suggestion, feedback, or collaboration idea? We'd love to hear from you. Reach out through the website.</p>
        </div>
      </div>
    </div>
  );
}
