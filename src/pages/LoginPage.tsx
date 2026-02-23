import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Zap } from 'lucide-react';
import { useSignIn, useGoogleAuthUrl } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const { mutate: signIn, isPending, error } = useSignIn();
  const { data: googleAuthUrl, isLoading: isLoadingGoogleUrl } =
    useGoogleAuthUrl();

  const googleError = searchParams.get('error') === 'google_auth_failed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn({ email, password });
  };

  const handleGoogleSignIn = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    }
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

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
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
              marginBottom: '28px',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Sign in to your account to continue
          </p>

          {(error || googleError) && (
            <Alert
              variant='destructive'
              style={{
                marginBottom: '20px',
                background: 'rgba(255,59,92,0.08)',
                border: '1px solid rgba(255,59,92,0.2)',
              }}
            >
              <AlertDescription style={{ color: '#ff3b5c', fontSize: '13px' }}>
                {googleError
                  ? 'Google authentication failed. Please try again.'
                  : error?.message || 'An unexpected error occurred.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            type='button'
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogleUrl || isPending}
            style={{
              width: '100%',
              height: '48px',
              background: '#fff',
              color: '#1f1f1f',
              border: '1px solid rgba(124,92,252,0.2)',
              borderRadius: '12px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: isLoadingGoogleUrl ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '24px',
            }}
            onMouseEnter={(e) => {
              if (!isLoadingGoogleUrl) {
                (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.transform =
                'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {isLoadingGoogleUrl ? (
              <Loader2
                style={{
                  width: '20px',
                  height: '20px',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <>
                <svg width='20' height='20' viewBox='0 0 24 24'>
                  <path
                    fill='#4285F4'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <Separator
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)',
              height: '1px',
              marginBottom: '24px',
            }}
          />

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
                  />
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
