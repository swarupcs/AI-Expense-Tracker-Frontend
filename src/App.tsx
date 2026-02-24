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
      {/* Main content: on mobile, add top padding for fixed header + bottom padding for bottom nav */}
      <main
        className='flex-1 overflow-hidden relative md:pt-0 md:pb-0'
        style={{
          // CSS variables make it easy to adjust header/bottomnav heights in one place
          paddingTop: 'var(--mobile-header-height, 56px)',
          paddingBottom: 'var(--mobile-bottomnav-height, 64px)',
        }}
      >
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
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
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
