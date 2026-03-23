import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            Naming<span>Contest</span>
          </div>
          <p className="footer-tagline">
            Collaborative naming made simple
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Product</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#examples">Examples</a>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="https://catchword.com" target="_blank" rel="noopener noreferrer">Catchword</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Namico.com. All rights reserved.</p>
        <p className="footer-catchword">
          Powered by <a href="https://catchword.com" target="_blank" rel="noopener noreferrer">Catchword</a>, the world's leading naming firm
        </p>
      </div>
    </footer>
  );
}
