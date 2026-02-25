import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import ChatPage from '@/pages/ChatPage';
import ExpensesPage from '@/pages/ExpensesPage';
import InsightsPage from '@/pages/InsightsPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import GoogleCallbackPage from '@/pages/GoogleCallbackPage';
import { useAuthStore } from '@/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppShell() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#080810',
      }}
    >
      <Sidebar />

      {/*
        KEY FIX: `overflow: hidden` here is intentional — it clips the main
        container so each PAGE can independently manage its own scroll via
        an inner `overflow-y: auto` div. This prevents the entire shell from
        scrolling and allows the header to stay sticky within each page.

        On mobile the top header is 56px and the bottom nav is 64px, so we
        pad the top and bottom accordingly via CSS variables.
      */}
      <main
        className='flex-1 relative'
        style={{
          overflow: 'hidden',
          // On mobile: push content below fixed top bar + above bottom nav
          paddingTop: 'var(--mobile-header-height, 0px)',
          paddingBottom: 'var(--mobile-bottomnav-height, 0px)',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(124,92,252,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Page content — fills remaining height so pages can scroll internally */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/chat' element={<ChatPage />} />
            <Route path='/expenses' element={<ExpensesPage />} />
            <Route path='/insights' element={<InsightsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHydrator>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route
              path='/auth/google/callback'
              element={<GoogleCallbackPage />}
            />
            <Route element={<ProtectedRoute />}>
              <Route path='/*' element={<AppShell />} />
            </Route>
          </Routes>
        </AuthHydrator>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
