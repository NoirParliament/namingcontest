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

// `decor` accepts a variant name: "warm" | "cool" | "fresh" — or any falsy
// value to disable. Variants pick their own gradient palette + a randomised
// set of dot positions/shapes (defined in legal.css).
export default function LegalPage({ title, updated, eyebrow = 'Legal', decor = '', children }) {
  // Backward-compat: `decor` used to be a boolean. true → "warm".
  const variant = decor === true ? 'warm' : decor;
  const { pathname } = useLocation();
  // Land at the top whenever you arrive on (or switch between) legal
  // pages — clicking Privacy from the Terms footer should start you at
  // the top, not wherever you were scrolled.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className={`lp-v3 legal-page ${variant ? `legal-decor-on legal-decor-${variant}` : ''}`}>
      <div className="frame">
        {variant && (
          <div className="legal-decor" aria-hidden="true">
            <span className="legal-decor-gradient" />
            <span className="ldot ldot-1" />
            <span className="ldot ldot-2" />
            <span className="ldot ldot-3" />
            <span className="ldot ldot-4" />
            <span className="ldot ldot-5" />
            <span className="ldot ldot-6" />
            {/* Sparse trail scattered down the page toward the footer. */}
            <span className="ldot ldot-7" />
            <span className="ldot ldot-8" />
            <span className="ldot ldot-9" />
            <span className="ldot ldot-10" />
            <span className="ldot ldot-11" />
            <span className="ldot ldot-12" />
            <span className="ldot ldot-13" />
            <span className="ldot ldot-14" />
            <span className="ldot ldot-15" />
            <span className="ldot ldot-16" />
            <span className="ldot ldot-17" />
          </div>
        )}
        <div className="wrap">
          <Nav />

          <main className="legal-main" role="main">
            <article className="legal-article">
              <p className="legal-eyebrow">{eyebrow}</p>
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
