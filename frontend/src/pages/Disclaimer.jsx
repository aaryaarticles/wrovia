import { Link } from "react-router-dom";
export default function Disclaimer() {
  return (
    <div className="legal-wrap">
      <div className="legal-card">
        <Link to="/" className="legal-back"><i className="fa-solid fa-arrow-left"></i> Home</Link>
        <h1><i className="fa-solid fa-circle-exclamation"></i> Disclaimer</h1>
        <p className="legal-updated">Last updated: June 2025</p>
        <div className="legal-content">
          <h2>General Information Only</h2>
          <p>The content published on Wrovia is intended for general informational and educational purposes only. It does not constitute professional, medical, legal, financial, or psychological advice.</p>
          <h2>No Guarantee of Accuracy</h2>
          <p>While we strive to provide accurate and up-to-date information, we make no warranties or representations about the completeness, accuracy, or reliability of any content.</p>
          <h2>External Links</h2>
          <p>Our articles may reference or link to external websites. We are not responsible for the content, accuracy, or practices of those websites.</p>
          <h2>Results May Vary</h2>
          <p>Any strategies, techniques, or ideas discussed in our articles may not produce the same results for every individual. Personal results depend on many factors.</p>
          <h2>Affiliate Disclosure</h2>
          <p>Wrovia currently does not use affiliate links or sponsored content. All recommendations are based solely on editorial judgment.</p>
        </div>
      </div>
    </div>
  );
}
