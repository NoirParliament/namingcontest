import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { Eye, EyeSlash, ArrowRight, UserCircle } from '@phosphor-icons/react';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'

  const selectedGroup = localStorage.getItem('selectedGroup') || 'business';
  const selectedSubSegment = localStorage.getItem('selectedSubSegment') || 'company-name';
  const tc = getGroupTheme(selectedGroup);

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
      background: '#fafaf5',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '0.5px solid rgba(30,35,48,0.08)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: tc.primary,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="NamingContest" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e2330' }}>NamingContest</span>
        </Link>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Choose Type', 'Account', 'Sub-type', 'Brief'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i <= 1 ? tc.primary : 'rgba(30,35,48,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: i <= 1 ? tc.btnText : '#8a8a82',
                }}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  color: i === 1 ? '#1e2330' : i < 1 ? tc.primary : '#8a8a82',
                  fontWeight: i <= 1 ? 600 : 400,
                }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 1, background: 'rgba(30,35,48,0.08)' }} />}
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
              background: `rgba(${tc.primaryRgb},0.08)`,
              border: `0.5px solid rgba(${tc.primaryRgb},0.2)`,
              borderRadius: 9999,
              padding: '4px 14px',
              fontSize: 12, fontWeight: 600, color: tc.primary,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              {tc.label} Contest
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
              fontSize: 34, fontWeight: 800,
              color: '#1e2330',
              marginBottom: 8,
            }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 14, color: '#676b5f', lineHeight: 1.5 }}>
              {mode === 'signup'
                ? 'One account to launch unlimited contests and track results'
                : 'Sign in to access your contests and continue'}
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: '#ffffff',
            border: '0.5px solid rgba(30,35,48,0.1)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#676b5f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
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
                    background: '#ffffff',
                    border: '0.5px solid rgba(30,35,48,0.15)',
                    borderRadius: 10,
                    height: 48,
                    padding: '0 16px',
                    color: '#1e2330',
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = `rgba(${tc.primaryRgb},0.5)`}
                  onBlur={e => e.target.style.borderColor = 'rgba(30,35,48,0.15)'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#676b5f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
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
                      background: '#ffffff',
                      border: '0.5px solid rgba(30,35,48,0.15)',
                      borderRadius: 10,
                      height: 48,
                      padding: '0 44px 0 16px',
                      color: '#1e2330',
                      fontSize: 14,
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = `rgba(${tc.primaryRgb},0.5)`}
                    onBlur={e => e.target.style.borderColor = 'rgba(30,35,48,0.15)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8a8a82', padding: 0,
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div style={{ fontSize: 11, color: '#8a8a82', marginTop: 6 }}>
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
                  background: tc.primary,
                  border: 'none',
                  borderRadius: 12,
                  color: tc.btnText,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
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
                      borderTopColor: tc.btnText,
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
              <div style={{ flex: 1, height: 1, background: 'rgba(30,35,48,0.08)' }} />
              <span style={{ fontSize: 12, color: '#8a8a82' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(30,35,48,0.08)' }} />
            </div>

            {/* Guest option */}
            <button
              onClick={handleGuest}
              style={{
                width: '100%',
                height: 44,
                background: 'transparent',
                border: '0.5px solid rgba(30,35,48,0.15)',
                borderRadius: 10,
                color: '#676b5f',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(30,35,48,0.25)'; e.currentTarget.style.color = '#1e2330'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(30,35,48,0.15)'; e.currentTarget.style.color = '#676b5f'; }}
            >
              <UserCircle size={16} />
              Continue as Guest
            </button>

            <p style={{ fontSize: 11, color: '#8a8a82', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
              Guest mode: limited to 1 contest, 5 participants. No saved history.
            </p>
          </div>

          {/* Toggle signup/signin */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#8a8a82' }}>
            {mode === 'signup'
              ? 'Already have an account?'
              : "Don't have an account?"}
            {' '}
            <button
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              style={{
                background: 'none', border: 'none',
                color: tc.primary, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', padding: 0,
                fontFamily: "'Inter', sans-serif",
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
