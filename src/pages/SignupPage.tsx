import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Zap, Check } from 'lucide-react';
import { useSignUp } from '@/services/auth.service';

const PASSWORD_RULES = [
  { label: '8+ chars', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { mutate: signUp, isPending, error } = useSignUp();

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const passwordStrength = PASSWORD_RULES.filter((r) =>
    r.test(form.password),
  ).length;
  const strengthColors = ['', '#ff3b5c', '#ffb830', '#84cc16', '#00ff87'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    background:
      focused === name ? 'rgba(124,92,252,0.07)' : 'rgba(13,13,26,0.8)',
    border: `1px solid ${focused === name ? 'rgba(124,92,252,0.5)' : 'rgba(124,92,252,0.12)'}`,
    borderRadius: '10px',
    color: '#f0efff',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,92,252,0.1)' : 'none',
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
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)',
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
            marginBottom: '40px',
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
            Create account
          </h2>
          <p
            style={{ color: '#4a4870', fontSize: '14px', marginBottom: '28px' }}
          >
            Start tracking your expenses with AI
          </p>
          <div
            style={{
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)',
              marginBottom: '24px',
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
                marginBottom: '18px',
              }}
            >
              {error.message}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signUp(form);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
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
                Full Name
              </label>
              <input
                type='text'
                value={form.name}
                onChange={set('name')}
                placeholder='John Doe'
                required
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                style={inputStyle('name')}
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
                Email Address
              </label>
              <input
                type='email'
                value={form.email}
                onChange={set('email')}
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
                  value={form.password}
                  onChange={set('password')}
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

              {form.password.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  {/* Strength bar */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '10px',
                    }}
                  >
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          height: '3px',
                          flex: 1,
                          borderRadius: '2px',
                          background:
                            passwordStrength >= step
                              ? strengthColors[passwordStrength]
                              : 'rgba(124,92,252,0.1)',
                          transition: 'background 0.3s',
                          boxShadow:
                            passwordStrength >= step
                              ? `0 0 6px ${strengthColors[passwordStrength]}60`
                              : 'none',
                        }}
                      />
                    ))}
                  </div>
                  {/* Strength label */}
                  {passwordStrength > 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: strengthColors[passwordStrength],
                        fontFamily: '"JetBrains Mono", monospace',
                        marginBottom: '10px',
                      }}
                    >
                      {strengthLabels[passwordStrength]}
                    </div>
                  )}
                  {/* Rules */}
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                  >
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(form.password);
                      return (
                        <div
                          key={rule.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${ok ? 'rgba(0,255,135,0.3)' : 'rgba(124,92,252,0.12)'}`,
                            background: ok
                              ? 'rgba(0,255,135,0.07)'
                              : 'transparent',
                            fontSize: '10px',
                            fontFamily: '"JetBrains Mono", monospace',
                            color: ok ? '#00ff87' : '#4a4870',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Check
                            style={{
                              width: '9px',
                              height: '9px',
                              opacity: ok ? 1 : 0.3,
                            }}
                          />
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                marginTop: '4px',
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
                  Creating…
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
              marginTop: '24px',
            }}
          >
            Already have an account?{' '}
            <Link
              to='/login'
              style={{
                color: '#9d7fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
