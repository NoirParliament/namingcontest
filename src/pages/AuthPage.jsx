import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { Eye, EyeSlash, ArrowRight, UserCircle } from '@phosphor-icons/react';

const TIER_CONFIG = {
  business: { color: '#eaef09', colorRgb: '234,239,9', textColor: '#000', label: 'Business' },
  team: { color: '#8B5CF6', colorRgb: '139,92,246', textColor: '#fff', label: 'Team' },
  personal: { color: '#10B981', colorRgb: '16,185,129', textColor: '#fff', label: 'Personal' },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'

  const selectedGroup = localStorage.getItem('selectedGroup') || 'business';
  const selectedSubSegment = localStorage.getItem('selectedSubSegment') || 'company-name';
  const tc = TIER_CONFIG[selectedGroup] || TIER_CONFIG.business;

  const contestType = localStorage.getItem('contestType') || 'submission_voting';

  const getNextRoute = () => {
    return `/select/${selectedGroup}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(getNextRoute());
    }, 800);
  };

  const handleGuest = () => {
    localStorage.setItem('guestMode', 'true');
    navigate(getNextRoute());
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: '#eaef09',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="Namico" style={{ width: 20, height: 20, display: 'block' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Namico</span>
        </Link>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Choose Type', 'Account', 'Sub-type', 'Brief'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i <= 1 ? tc.color : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: i <= 1 ? (selectedGroup === 'business' ? '#000' : '#fff') : '#7a7a7a',
                }}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  color: i === 1 ? '#fff' : i < 1 ? tc.color : '#7a7a7a',
                  fontWeight: i <= 1 ? 600 : 400,
                }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <div style={{ width: 130 }} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 440,
        }}>
          {/* Tier badge */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 24,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `rgba(${tc.colorRgb},0.1)`,
              border: `0.5px solid rgba(${tc.colorRgb},0.25)`,
              borderRadius: 9999,
              padding: '4px 14px',
              fontSize: 12, fontWeight: 600, color: tc.color,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              {tc.label} Contest
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 34, fontWeight: 800,
              color: '#fff',
              marginBottom: 8,
            }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.5 }}>
              {mode === 'signup'
                ? 'One account to launch unlimited contests and track results'
                : 'Sign in to access your contests and continue'}
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#1a1a1a',
            border: `0.5px solid rgba(${tc.colorRgb},0.2)`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 16,
          }}>
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#a1a1a1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    background: '#141414',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    height: 48,
                    padding: '0 16px',
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = `rgba(${tc.colorRgb},0.5)`}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#a1a1a1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'}
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      background: '#141414',
                      border: '0.5px solid rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      height: 48,
                      padding: '0 44px 0 16px',
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = `rgba(${tc.colorRgb},0.5)`}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#7a7a7a', padding: 0,
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 6 }}>
                    Minimum 8 characters
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 52,
                  background: tc.color,
                  border: 'none',
                  borderRadius: 12,
                  color: tc.textColor,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: tc.textColor,
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: '#7a7a7a' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Guest option */}
            <button
              onClick={handleGuest}
              style={{
                width: '100%',
                height: 44,
                background: 'transparent',
                border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: '#a1a1a1',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1a1'; }}
            >
              <UserCircle size={16} />
              Continue as Guest
            </button>

            <p style={{ fontSize: 11, color: '#7a7a7a', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
              Guest mode: limited to 1 contest, 5 participants. No saved history.
            </p>
          </div>

          {/* Toggle signup/signin */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#7a7a7a' }}>
            {mode === 'signup'
              ? 'Already have an account?'
              : "Don't have an account?"}
            {' '}
            <button
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              style={{
                background: 'none', border: 'none',
                color: tc.color, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', padding: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {mode === 'signup' ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>


      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
