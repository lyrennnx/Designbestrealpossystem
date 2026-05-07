import React, { useState } from 'react';
import { Eye, EyeOff, ShoppingBag, User, Lock, LogIn, UserPlus, IdCard } from 'lucide-react';
import { usePOS, UserRole } from '../context/POSContext';
import { useIsPhone, useIsTablet } from './shared/useMediaQuery';

export function LoginScreen() {
  const { login, signUp, hasUsers } = usePOS();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('owner');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();
  // Anything <=1024 wants a touch-friendly layout, but the visual density
  // is different between a phone (≤640px, tight, fills screen) and a
  // tablet / iPad portrait (641–1024px, roomy centered card).
  const isMobile = isPhone || isTablet;

  const handleLogin = () => {
    if (mode === 'signup') {
      if (!fullName || !username || !password) { setError('Please fill in all fields.'); return; }
      if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
      setLoading(true);
      setError('');
      setTimeout(() => {
        const res = signUp(fullName, username, password, role);
        if (!res.ok) {
          setError(res.error ?? 'Could not create account.');
          setLoading(false);
        }
      }, 550);
      return;
    }
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(username, password, role);
      if (!ok) {
        setError('Incorrect username or password.');
        setLoading(false);
      }
    }, 550);
  };

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setError('');
    setFullName('');
    setUsername('');
    setPassword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      minHeight: '100dvh', height: '100dvh',
      display: 'flex',
      // Phone fills the screen top-down. Tablet & desktop center the card.
      alignItems: isPhone ? 'stretch' : 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'auto',
      padding: isPhone ? '0' : '20px',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {/* Animated background blobs */}
      {[
        { top: '10%', left: '15%', size: 380, color: 'rgba(124,58,237,0.15)', delay: 0 },
        { top: '60%', right: '10%', size: 280, color: 'rgba(79,70,229,0.12)', delay: 2 },
        { top: '30%', right: '25%', size: 200, color: 'rgba(139,92,246,0.1)', delay: 1 },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          width: b.size, height: b.size,
          background: b.color,
          top: b.top, left: (b as any).left, right: (b as any).right,
          filter: 'blur(60px)',
          animation: `pulse ${4 + b.delay}s ease-in-out infinite alternate`,
        }} />
      ))}

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%',
        // Phone: full width, fills screen.
        // Tablet: 480px centered card with roomier padding.
        // Desktop: existing 420px card.
        maxWidth: isPhone ? '100%' : isTablet ? 480 : 420,
        margin: isPhone ? 0 : '0 16px',
        padding: isPhone ? '28px 18px 24px' : 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: isPhone ? 'flex-start' : 'center',
        gap: isPhone ? 16 : 0,
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: isPhone ? 16 : isTablet ? 24 : 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16, padding: '12px 24px', marginBottom: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}>
              <ShoppingBag size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
                the <span style={{ color: '#a78bfa' }}>1470.</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
                GOOD SCENTS GOOD VIBES
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            Point of Sale System · v3.07
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: isPhone ? 14 : 20,
          // Phone: tight 18px padding so the form feels close to the edges.
          // Tablet: roomy 28px so the card breathes on iPad portrait.
          // Desktop: 32px.
          padding: isPhone ? 18 : isTablet ? 28 : 32,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              {mode === 'signup' ? 'Create account as' : 'Sign in as'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['owner', '👑', 'Owner'], ['employee', '👤', 'Employee']] as [UserRole, string, string][]).map(([r, icon, label]) => (
                <button key={r} onClick={() => { setRole(r); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    borderRadius: 12, border: `2px solid ${role === r ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                    background: role === r ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    color: role === r ? 'white' : 'rgba(255,255,255,0.5)',
                    fontFamily: 'inherit',
                    minHeight: 48,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
                  {role === r && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          {[
            ...(mode === 'signup' ? [{ label: 'Full Name', id: 'name', icon: <IdCard size={15} />, value: fullName, onChange: setFullName, type: 'text', placeholder: 'Enter full name' }] : []),
            { label: 'Username', id: 'user', icon: <User size={15} />, value: username, onChange: setUsername, type: 'text', placeholder: mode === 'signup' ? 'Choose a username' : 'Enter username' },
            { label: 'Password', id: 'pass', icon: <Lock size={15} />, value: password, onChange: setPassword, type: showPass ? 'text' : 'password', placeholder: mode === 'signup' ? 'Choose a password' : 'Enter password' },
          ].map((field) => (
            <div key={field.id} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                {field.label}
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }}>
                  {field.icon}
                </div>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: isMobile ? '15px 16px 15px 44px' : '12px 14px 12px 40px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: 'white',
                    fontSize: isMobile ? 16 : 14,
                    fontFamily: 'inherit', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                {field.id === 'pass' && (
                  <button onClick={() => setShowPass(!showPass)} type="button"
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleLogin} disabled={loading}
            style={{
              width: '100%', padding: isMobile ? '16px' : '14px',
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: isMobile ? 16 : 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
              transition: 'all 0.2s',
              letterSpacing: 0.3,
              minHeight: 52,
            }}
          >
            {loading ? (
              <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />{mode === 'signup' ? 'Creating account…' : 'Signing in…'}</>
            ) : mode === 'signup' ? (
              <><UserPlus size={16} />Create Account</>
            ) : (
              <><LogIn size={16} />Sign In</>
            )}
          </button>

          {/* Mode toggle */}
          <div style={{
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}>
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                {hasUsers ? 'Already have an account?' : 'Already registered?'}{' '}
                <button type="button" onClick={() => switchMode('signin')}
                  style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { from { opacity: 0.6; transform: scale(1); } to { opacity: 1; transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  );
}
