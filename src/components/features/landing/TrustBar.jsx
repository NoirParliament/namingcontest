import './TrustBar.css';

export default function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="trust-bar-content">
        <div className="trust-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0L12.9389 6.90983L20 8L15 13.0902L16.1803 20L10 16.9098L3.81966 20L5 13.0902L0 8L7.06107 6.90983L10 0Z" fill="currentColor"/>
          </svg>
          <span>Powered by Catchword</span>
        </div>
        <p className="trust-text">
          The #1 Ranked Naming Agency Worldwide
        </p>
      </div>
    </div>
  );
}
