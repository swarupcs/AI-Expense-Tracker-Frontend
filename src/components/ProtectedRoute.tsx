import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Zap } from 'lucide-react';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#080810',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Animated logo */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(124,92,252,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Zap
              style={{ width: '28px', height: '28px', color: '#fff' }}
              strokeWidth={2.5}
            />
          </div>
          {/* Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '22px',
              border: '1px solid rgba(124,92,252,0.3)',
              animation: 'ringPulse 2s ease-in-out infinite',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: '#4a4870',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          Initializing…
        </div>
        <style>{`
          @keyframes pulse { 0%,100% { box-shadow:0 0 40px rgba(124,92,252,0.5); } 50% { box-shadow:0 0 60px rgba(124,92,252,0.8); } }
          @keyframes ringPulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:1; transform:scale(1.05); } }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  return <Outlet />;
}
