import { Link } from "react-router-dom";
export default function TermsOfService() {
  return (
    <div className="legal-wrap">
      <div className="legal-card">
        <Link to="/" className="legal-back"><i className="fa-solid fa-arrow-left"></i> Home</Link>
        <h1><i className="fa-solid fa-file-contract"></i> Terms of Service</h1>
        <p className="legal-updated">Last updated: June 2025</p>
        <div className="legal-content">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing Wrovia, you agree to these Terms of Service. If you do not agree, please do not use the website.</p>
          <h2>2. Use of Content</h2>
          <p>All articles, text, and images on this website are the property of Wrovia. You may read and share content for personal, non-commercial use with proper attribution.</p>
          <h2>3. Prohibited Activities</h2>
          <p>You may not copy, reproduce, or redistribute our content for commercial purposes without written permission. Automated scraping of the website is prohibited.</p>
          <h2>4. Disclaimer</h2>
          <p>Articles are for informational and educational purposes only. They do not constitute professional advice. Always consult a qualified professional for specific guidance.</p>
          <h2>5. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
          <h2>6. Governing Law</h2>
          <p>These terms are governed by applicable laws. Disputes will be resolved through appropriate legal channels.</p>
        </div>
      </div>
    </div>
  );
}
