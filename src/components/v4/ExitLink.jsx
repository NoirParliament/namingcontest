// ExitLink — drop-in replacement for `<Link to="/" className="v4-exit">`
// across the v4 flow. On click it briefly fades the page out before
// navigating, so leaving any v4 screen for the homepage doesn't feel
// like a jump-cut.
//
// The fade logic lives in `useFadeNav` so BrandLink and any future
// nav element can share the same exit feel.

import { Link } from 'react-router-dom';
import { X } from '@phosphor-icons/react';
import { useFadeNav } from './useFadeNav';

export default function ExitLink({ to = '/', children, ...rest }) {
  const fadeNav = useFadeNav();
  return (
    <Link to={to} className="v4-exit" onClick={fadeNav(to)} {...rest}>
      <X weight="regular" size={14} />
      <span>{children || 'Exit'}</span>
    </Link>
  );
}
