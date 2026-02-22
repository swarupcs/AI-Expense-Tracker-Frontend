import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  TrendingUp,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSignOut } from '@/services/auth.service';


const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/expenses', label: 'Expenses', icon: PieChart },
  { href: '/insights', label: 'Insights', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { mutate: signOut, isPending } = useSignOut();

  return (
    <aside
      style={{
        width: '72px',
        background: 'rgba(8,8,16,0.95)',
        borderRight: '1px solid rgba(124,92,252,0.12)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        padding: '20px 0',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Vertical gradient line */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '20%',
          bottom: '20%',
          width: '1px',
          background:
            'linear-gradient(180deg, transparent, rgba(124,92,252,0.4), rgba(0,212,255,0.3), transparent)',
        }}
      />

      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,92,252,0.5)',
            cursor: 'pointer',
          }}
        >
          <Zap
            style={{ width: '20px', height: '20px', color: '#fff' }}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          width: '100%',
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={item.label}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.15))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(124,92,252,0.4)'
                    : '1px solid transparent',
                  boxShadow: isActive
                    ? '0 0 15px rgba(124,92,252,0.25)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(124,92,252,0.1)';
                    e.currentTarget.style.border =
                      '1px solid rgba(124,92,252,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = '1px solid transparent';
                  }
                }}
              >
                <Icon
                  style={{
                    width: '18px',
                    height: '18px',
                    color: isActive ? '#9d7fff' : '#4a4870',
                    transition: 'color 0.2s',
                  }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '-13px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '20px',
                      borderRadius: '2px',
                      background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                      boxShadow: '0 0 8px rgba(124,92,252,0.6)',
                    }}
                  />
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User avatar + sign out */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px',
        }}
      >
        {user && (
          <div
            title={user.name}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background:
                'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
              border: '1px solid rgba(124,92,252,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              color: '#9d7fff',
              cursor: 'default',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={() => signOut()}
          disabled={isPending}
          title='Sign Out'
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#4a4870',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,59,92,0.1)';
            e.currentTarget.style.border = '1px solid rgba(255,59,92,0.2)';
            e.currentTarget.style.color = '#ff3b5c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.color = '#4a4870';
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </aside>
  );
}
