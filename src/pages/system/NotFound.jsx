// 404 — catch-all route. Uses the same site chrome (pill nav + footer)
// as the rest of the product so a wrong URL still feels on-brand.

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Nav, Footer } from '../LandingPage';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';
import '../../styles/legal.css';
import '../../styles/system.css';

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="lp-v3 legal-page">
      <div className="frame">
        <div className="wrap">
          <Nav />
          <main className="sys-main" role="main">
            <div className="sys-code">404</div>
            <h1 className="sys-title">This page wandered off.</h1>
            <p className="sys-sub">
              The link may be broken, or the page may have moved. Let&rsquo;s
              get you back on track.
            </p>
            <div className="sys-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/')}
              >
                Back to home <span className="arrow">→</span>
              </button>
              {/* The "Platform map" button that sat here pointed at the demo
                  gallery, which is unrouted for launch — it would have been a
                  404 offered from a 404. */}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
