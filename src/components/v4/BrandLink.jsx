// BrandLink — drop-in replacement for `<Link to="/" className="v4-brand">`
// wrapping the NamingContest logo across the v4 flow. Uses the same
// fade-out behaviour as ExitLink so clicking the logo from any v4
// screen gently transitions instead of jump-cutting.
//
// Destination is /. If the user is authed, the LandingPage's
// synchronous Navigate redirect bounces them to their workspace
// before any landing-page DOM paints — so the fade ends on either
// the marketing homepage (not-authed) or the workspace (authed)
// without flicker either way.

import { Link } from 'react-router-dom';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import { useFadeNav } from './useFadeNav';

export default function BrandLink({ to = '/' }) {
  const fadeNav = useFadeNav();
  return (
    <Link to={to} className="v4-brand" onClick={fadeNav(to)}>
      <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
    </Link>
  );
}
