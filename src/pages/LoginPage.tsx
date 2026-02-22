import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Zap } from 'lucide-react';
import { useSignIn } from '@/services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { mutate: signIn, isPending, error } = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn({ email, password });
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%',
    padding: '14px 16px',
    background:
      focused === name ? 'rgba(124,92,252,0.07)' : 'rgba(13,13,26,0.8)',
    border: `1px solid ${focused === name ? 'rgba(124,92,252,0.5)' : 'rgba(124,92,252,0.12)'}`,
    borderRadius: '10px',
    color: '#f0efff',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow:
      focused === name
        ? '0 0 0 3px rgba(124,92,252,0.1), inset 0 0 20px rgba(124,92,252,0.03)'
        : 'none',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)',
          animation: 'pulse 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          animation: 'pulse 10s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(124,92,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '48px',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124,92,252,0.5)',
            }}
          >
            <Zap
              style={{ width: '22px', height: '22px', color: '#fff' }}
              strokeWidth={2.5}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '22px',
                fontWeight: 800,
                color: '#f0efff',
                letterSpacing: '-0.5px',
              }}
            >
              ExpenseAI
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '10px',
                color: '#4a4870',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Smart Tracking
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(13,13,26,0.85)',
            border: '1px solid rgba(124,92,252,0.15)',
            borderRadius: '20px',
            padding: '40px',
            backdropFilter: 'blur(30px)',
            boxShadow:
              '0 0 80px rgba(124,92,252,0.05), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <h2
            style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: '26px',
              fontWeight: 800,
              color: '#f0efff',
              marginBottom: '6px',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              color: '#4a4870',
              fontSize: '14px',
              marginBottom: '32px',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Sign in to your account to continue
          </p>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)',
              marginBottom: '28px',
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(255,59,92,0.08)',
                border: '1px solid rgba(255,59,92,0.2)',
                borderRadius: '10px',
                color: '#ff3b5c',
                fontSize: '13px',
                marginBottom: '20px',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {error.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#8b89b0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                required
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={inputStyle('email')}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#8b89b0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('password'), paddingRight: '48px' }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#4a4870',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <Eye style={{ width: '16px', height: '16px' }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={isPending}
              style={{
                width: '100%',
                padding: '15px',
                background: isPending
                  ? 'rgba(124,92,252,0.4)'
                  : 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                cursor: isPending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                boxShadow: isPending
                  ? 'none'
                  : '0 0 30px rgba(124,92,252,0.35)',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {isPending ? (
                <>
                  <Loader2
                    style={{
                      width: '17px',
                      height: '17px',
                      animation: 'spin 1s linear infinite',
                    }}
                  />{' '}
                  Signing in…
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight style={{ width: '17px', height: '17px' }} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#4a4870',
              marginTop: '28px',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Don't have an account?{' '}
            <Link
              to='/signup'
              style={{
                color: '#9d7fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.05); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
