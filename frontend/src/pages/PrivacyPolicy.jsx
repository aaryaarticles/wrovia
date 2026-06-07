import { Link } from "react-router-dom";
export default function PrivacyPolicy() {
  return (
    <div className="legal-wrap">
      <div className="legal-card">
        <Link to="/" className="legal-back"><i className="fa-solid fa-arrow-left"></i> Home</Link>
        <h1><i className="fa-solid fa-shield-halved"></i> Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 2025</p>
        <div className="legal-content">
          <h2>1. Information We Collect</h2>
          <p>We collect minimal anonymous data to improve your experience. This includes a randomly generated device ID stored in your browser's local storage to track article views and likes — no personal information is stored.</p>
          <h2>2. How We Use Information</h2>
          <p>The anonymous device ID is used solely to count unique article views and prevent duplicate likes. We do not sell, share, or use this data for advertising purposes.</p>
          <h2>3. Cookies</h2>
          <p>We use session cookies only for admin authentication. Public visitors are not tracked via cookies.</p>
          <h2>4. Third-Party Services</h2>
          <p>We use Cloudinary for image hosting. Images are stored securely on their servers. Please review Cloudinary's privacy policy for details.</p>
          <h2>5. Data Security</h2>
          <p>We take reasonable measures to protect any data we store. Admin credentials are encrypted and sessions are secured via HTTP-only cookies.</p>
          <h2>6. Your Rights</h2>
          <p>Since we do not collect personal information from public visitors, there is no personal data to delete or modify. You may clear your browser's local storage at any time to reset your device ID.</p>
          <h2>7. Contact</h2>
          <p>For any privacy-related questions, please contact us through the website.</p>
        </div>
      </div>
    </div>
  );
}
