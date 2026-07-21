// Generic error / something-went-wrong page. Shown for unexpected
// failures (failed loads, broken magic links, server errors). Same
// site chrome as the rest of the product. Also reachable at
// /error for demo/reference purposes.

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Nav, Footer } from '../LandingPage';
import { SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';
import '../../styles/legal.css';
import '../../styles/system.css';

// Same fixed segment as the 404 and expired-link pages — the three are
// siblings and should feel like one set.
const SYSTEM_SEGMENT = 'p1';

export default function ErrorState({
  code = 'Error',
  title = 'We hit a snag.',
  message = 'An unexpected error occurred. Try again in a moment — if it keeps happening, get in touch and we’ll sort it out.',
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="lp-v3 legal-page sys-segment-page">
      <SegmentThemeBackdrop subId={SYSTEM_SEGMENT} minimal />
      <div className="frame">
        <div className="wrap">
          <Nav />
          <main className="sys-main" role="main">
            <div className="sys-eyebrow">{code}</div>
            <h1 className="sys-title">{title}</h1>
            <p className="sys-sub">{message}</p>
            <div className="sys-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/')}
              >
                Back to home
              </button>
            </div>
            <p className="sys-contact">
              Still stuck? Email{' '}
              <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>.
            </p>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
