// Sign-in link rejected — its own page rather than a notice bolted onto the
// namespace.
//
// URL: /link-expired
//
// A refused magic link used to land on /v4/settings, where a signed-out
// visitor sees the empty-account state: "Add your name", "no email saved",
// and an avatar in the corner. That reads as "my account is gone" rather than
// "that link didn't work" — the one thing a dead link must never do is look
// like data loss. Supabase reports the failure in the URL
// (#error=access_denied&error_code=otp_expired); AuthContext parses it and
// App routes here.
//
// Wears the segment backdrop the chat stages use, so a dead end still looks
// like the product rather than a browser error page.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import { Nav, Footer } from '../LandingPage';
import { SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import SignInModal from '../../components/v4/SignInModal';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';
import '../../styles/legal.css';
import '../../styles/system.css';

// Fixed rather than random: a system page should look the same every time you
// hit it. Blush is the warmest of the segment palettes, which suits a page
// whose job is to say "nothing's broken, here's the way back".
const SYSTEM_SEGMENT = 'p1';

export default function LinkExpired() {
  const navigate = useNavigate();
  const [signinOpen, setSigninOpen] = useState(false);

  return (
    <div className="lp-v3 legal-page sys-segment-page">
      <SegmentThemeBackdrop subId={SYSTEM_SEGMENT} minimal />
      <div className="frame">
        <div className="wrap">
          <Nav />
          <main className="sys-main" role="main">
            <div className="sys-eyebrow">Sign-in link</div>
            <h1 className="sys-title">That link has already been used.</h1>
            <p className="sys-sub">
              Sign-in links work once, and only for a short while — and mail
              apps sometimes open them before you do. Nothing is wrong with
              your account. Ask for a fresh one and you&rsquo;ll be straight in.
            </p>
            <div className="sys-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setSigninOpen(true)}
              >
                <PaperPlaneTilt weight="bold" size={14} />
                Send a new link
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/')}
              >
                Back to home
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <SignInModal open={signinOpen} onClose={() => setSigninOpen(false)} />
    </div>
  );
}
