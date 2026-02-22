import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  TrendingUp,
  Zap,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSignOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
    <TooltipProvider>
      <aside className='w-64 flex flex-col h-screen bg-[#0a0a0c] border-r border-[#1c1c22]'>
        {/* Logo */}
        <div className='p-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-[--primary] flex items-center justify-center shadow-lg shrink-0'>
              <Zap
                className='w-5 h-5 text-[--primary-foreground]'
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h1 className='font-display text-lg font-bold text-[--foreground] tracking-tight'>
                ExpenseAI
              </h1>
              <p className='text-[10px] text-[--foreground-secondary] font-mono uppercase tracking-widest'>
                Smart Tracking
              </p>
            </div>
          </div>
        </div>

        <Separator className='bg-[#1c1c22]' />

        {/* Nav */}
        <nav className='flex-1 px-3 py-5 space-y-0.5'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <NavLink to={item.href} tabIndex={-1}>
                    <Button
                      variant='ghost'
                      className={[
                        'w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-all duration-150',
                        isActive
                          ? 'bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90'
                          : 'text-[--foreground-secondary] hover:text-[--foreground] hover:bg-[#161619]',
                      ].join(' ')}
                    >
                      <Icon
                        className='w-4 h-4 shrink-0'
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className='ml-auto w-1.5 h-1.5 rounded-full bg-[--primary-foreground] opacity-70' />
                      )}
                    </Button>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side='right' className='hidden'>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <Separator className='bg-[#1c1c22]' />

        {/* User + Sign out */}
        <div className='p-4 space-y-2'>
          {user && (
            <div className='px-3 py-3 rounded-lg bg-[#111114] flex items-center gap-3'>
              <Avatar className='w-7 h-7 rounded-lg shrink-0'>
                <AvatarFallback className='rounded-lg bg-[--primary]/20 border border-[--primary]/30 text-[--primary] text-[10px] font-bold'>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-medium text-[--foreground] truncate'>
                  {user.name}
                </p>
                <p className='text-[10px] text-[--foreground-secondary] truncate font-mono'>
                  {user.email}
                </p>
              </div>
              <Badge
                variant='outline'
                className='border-green-900/40 bg-[#0f1a10] text-green-400 text-[9px] font-mono px-1.5 shrink-0'
              >
                {user.role}
              </Badge>
            </div>
          )}

          <Button
            variant='ghost'
            onClick={() => signOut()}
            disabled={isPending}
            className='w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm text-[--foreground-secondary] hover:text-red-400 hover:bg-red-950/20 transition-all duration-150'
          >
            <LogOut className='w-4 h-4 shrink-0' />
            <span>{isPending ? 'Signing out…' : 'Sign Out'}</span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
