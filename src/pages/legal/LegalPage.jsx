// Shared layout for the three legal documents (Privacy / Terms /
// Cookies). Wraps the content in the SAME site chrome as the rest of
// the product — the landing-v3 pill nav at the top and the full
// landing footer at the bottom — so the legal pages read as part of
// NamingContest, not a bolt-on. The journey-tracker FloatingNav is
// suppressed on these routes in App.jsx.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Nav, Footer } from '../LandingPage';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';
import '../../styles/legal.css';

export default function LegalPage({ title, updated, children }) {
  const { pathname } = useLocation();
  // Land at the top whenever you arrive on (or switch between) legal
  // pages — clicking Privacy from the Terms footer should start you at
  // the top, not wherever you were scrolled.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="lp-v3 legal-page">
      <div className="frame">
        <div className="wrap">
          <Nav />

          <main className="legal-main" role="main">
            <article className="legal-article">
              <h1 className="legal-title">{title}</h1>
              {updated && (
                <p className="legal-updated">Last updated: {updated}</p>
              )}
              <div className="legal-body">{children}</div>
            </article>
          </main>
        </div>

        {/* Footer lives OUTSIDE .wrap (same as the homepage) so it spans
            the full frame width instead of the narrow content column. */}
        <Footer />
      </div>
    </div>
  );
}
