import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  TrendingUp,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSignOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen shrink-0 relative transition-all duration-300 ease-in-out',
          'bg-[rgba(8,8,16,0.95)] border-r border-[rgba(124,92,252,0.12)] backdrop-blur-xl',
          isExpanded ? 'w-60' : 'w-[72px]',
        )}
        style={{ padding: '20px 0' }}
      >
        {/* Vertical gradient line */}
        <div
          className='absolute right-0 top-[20%] bottom-[20%] w-px'
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(124,92,252,0.4), rgba(0,212,255,0.3), transparent)',
          }}
        />

        {/* Logo & Header */}
        <div
          className={cn(
            'flex items-center gap-3 mb-8 transition-all',
            isExpanded ? 'justify-start px-5' : 'justify-center',
          )}
        >
          <div
            className='w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer'
            style={{
              background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
              boxShadow: '0 0 20px rgba(124,92,252,0.5)',
            }}
          >
            <Zap className='w-5 h-5 text-white' strokeWidth={2.5} />
          </div>
          {isExpanded && (
            <div
              className='transition-opacity duration-200'
              style={{ opacity: isExpanded ? 1 : 0, whiteSpace: 'nowrap' }}
            >
              <div className='font-display text-lg font-extrabold text-[--foreground] tracking-tight'>
                ExpenseAI
              </div>
              <div className='font-mono text-[9px] text-[--foreground-subtle] tracking-wider uppercase'>
                Smart Tracking
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div
          className={cn(
            'mb-4 transition-all',
            isExpanded ? 'px-5 flex justify-end' : 'flex justify-center',
          )}
        >
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-8 w-8 bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.2)] hover:bg-[rgba(124,92,252,0.2)] hover:border-[rgba(124,92,252,0.4)] text-[--violet-bright]'
          >
            {isExpanded ? (
              <ChevronLeft className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            'flex flex-col gap-1 flex-1',
            isExpanded ? 'px-5' : 'items-center',
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            const navButton = (
              <NavLink to={item.href} className='w-full'>
                <Button
                  variant='ghost'
                  className={cn(
                    'relative transition-all h-12 rounded-xl',
                    isExpanded
                      ? 'w-full justify-start gap-3 px-3.5'
                      : 'w-12 justify-center',
                    isActive
                      ? 'bg-gradient-to-br from-[rgba(124,92,252,0.3)] to-[rgba(0,212,255,0.15)] border border-[rgba(124,92,252,0.4)] shadow-[0_0_15px_rgba(124,92,252,0.25)]'
                      : 'border border-transparent hover:bg-[rgba(124,92,252,0.1)] hover:border-[rgba(124,92,252,0.2)]',
                  )}
                >
                  <Icon
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive
                        ? 'text-[--violet-bright]'
                        : 'text-[--foreground-subtle]',
                    )}
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isExpanded && (
                    <span
                      className={cn(
                        'font-sans text-sm transition-colors whitespace-nowrap',
                        isActive
                          ? 'text-[--foreground] font-semibold'
                          : 'text-[--foreground-muted] font-medium',
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                  {isActive && !isExpanded && (
                    <div
                      className='absolute -right-[13px] top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-sm'
                      style={{
                        background: 'linear-gradient(180deg, #7c5cfc, #00d4ff)',
                        boxShadow: '0 0 8px rgba(124,92,252,0.6)',
                      }}
                    />
                  )}
                </Button>
              </NavLink>
            );

            return isExpanded ? (
              <div key={item.href}>{navButton}</div>
            ) : (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-[#0d0d1a] border-[rgba(124,92,252,0.2)]'
                >
                  <p className='font-sans text-sm'>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Section */}
        <div
          className={cn(
            'flex flex-col gap-3 mt-2',
            isExpanded ? 'px-5' : 'items-center',
          )}
        >
          <Separator className='bg-[rgba(124,92,252,0.12)]' />

          {user && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl transition-all',
                isExpanded
                  ? 'p-2.5 px-3 bg-[rgba(124,92,252,0.08)] border border-[rgba(124,92,252,0.15)]'
                  : 'justify-center',
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className='w-[38px] h-[38px] rounded-xl shrink-0 cursor-default'>
                    <AvatarFallback className='rounded-xl bg-gradient-to-br from-[rgba(124,92,252,0.3)] to-[rgba(0,212,255,0.2)] border border-[rgba(124,92,252,0.3)] text-[--violet-bright] font-display font-bold text-sm'>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent
                    side='right'
                    className='bg-[#0d0d1a] border-[rgba(124,92,252,0.2)]'
                  >
                    <p className='font-sans text-sm font-semibold'>
                      {user.name}
                    </p>
                    <p className='font-mono text-xs text-[--foreground-secondary]'>
                      {user.email}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
              {isExpanded && (
                <div
                  className='min-w-0 flex-1 transition-opacity duration-200'
                  style={{ opacity: isExpanded ? 1 : 0 }}
                >
                  <div className='font-sans text-[13px] font-semibold text-[--foreground] truncate'>
                    {user.name}
                  </div>
                  <div className='font-mono text-[10px] text-[--foreground-subtle] truncate'>
                    {user.email}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sign Out Button */}
          {isExpanded ? (
            <Button
              variant='ghost'
              onClick={() => signOut()}
              disabled={isPending}
              className='w-full h-[38px] justify-start gap-2.5 px-3.5 text-[--foreground-secondary] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/40 border border-transparent transition-all font-sans text-sm font-medium disabled:opacity-50'
            >
              <LogOut className='h-4 w-4 shrink-0' />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => signOut()}
                  disabled={isPending}
                  className='w-[38px] h-[38px] text-[--foreground-secondary] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/40 border border-transparent transition-all disabled:opacity-50'
                >
                  <LogOut className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='right'
                className='bg-[#0d0d1a] border-[rgba(124,92,252,0.2)]'
              >
                <p className='font-sans text-sm'>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
