import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-[#09090b]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin' />
          <p className='text-xs font-mono text-[--foreground-secondary] uppercase tracking-widest'>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  return <Outlet />;
}
