import { Link } from 'react-router-dom';
import { TwitterLogo, LinkedinLogo, InstagramLogo } from '@phosphor-icons/react';
import namicoIcon from '../../assets/namico-icon.svg';

function placeholder(e) {
  e.preventDefault();
  const msg = document.createElement('div');
  Object.assign(msg.style, { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1e2330', border: '1px solid rgba(210,232,35,0.2)', color: '#e8efd6', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', zIndex: '99999', transition: 'opacity 0.3s' });
  msg.textContent = 'This page will be available in the final build';
  document.body.appendChild(msg);
  setTimeout(() => { msg.style.opacity = '0'; setTimeout(() => msg.remove(), 300); }, 2000);
}

export default function Footer() {
  return (
    <footer style={{ background: '#1e2330', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 40px 32px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: 48, marginBottom: 48 }}>

        {/* Brand */}
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, background: '#d2e823', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={namicoIcon} alt="NamingContest" style={{ width: 18, height: 18, display: 'block', filter: 'brightness(0) invert(1)' }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>NamingContest</span>
          </div>
          <p style={{ fontSize: 13, color: '#ffffff', lineHeight: 1.6, marginBottom: 20 }}>
            Powered by Catchword, the #1 Ranked Naming Agency Worldwide.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="#" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)', transition: 'all 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#d2e823'; e.currentTarget.style.borderColor = 'rgba(210,232,35,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            ><TwitterLogo size={16} weight="bold" /></a>
            <a href="#" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)', transition: 'all 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#d2e823'; e.currentTarget.style.borderColor = 'rgba(210,232,35,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            ><LinkedinLogo size={16} weight="bold" /></a>
            <a href="#" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)', transition: 'all 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#d2e823'; e.currentTarget.style.borderColor = 'rgba(210,232,35,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            ><InstagramLogo size={16} weight="bold" /></a>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {/* Product */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d2e823', marginBottom: 16 }}>Product</div>
            {[
              { label: 'How It Works', href: '#shared-accountability' },
              { label: 'Examples', href: '#examples' },
              { label: 'Pricing', href: '#pricing' },
            ].map(l => l.isRoute ? (
              <Link key={l.label} to={l.href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#d2e823'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
              >{l.label}</Link>
            ) : (
              <a key={l.label} href={l.href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#d2e823'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
              >{l.label}</a>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d2e823', marginBottom: 16 }}>Powered by</div>
            {[
              { label: 'Catchword Branding', href: '#' },
              { label: 'Help Center', href: '#' },
              { label: 'Contact Us', href: '#' },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener noreferrer' : undefined}
                onClick={l.href === '#' ? placeholder : undefined}
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#d2e823'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
              >{l.label}</a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d2e823', marginBottom: 16 }}>Legal</div>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" onClick={placeholder}
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#d2e823'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
