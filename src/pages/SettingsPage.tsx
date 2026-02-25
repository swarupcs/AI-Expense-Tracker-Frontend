import { useState } from 'react';
import {
  Check,
  Loader2,
  User,
  Lock,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useChangePassword, useSignOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: signOut } = useSignOut();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReport: false,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password form
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const { mutateAsync: changePassword, isPending: isChangingPw } =
    useChangePassword();

  const toggle = (key: keyof typeof settings) =>
    setSettings((p) => ({ ...p, [key]: !p[key] }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    try {
      await changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSuccess(true);
      setShowPasswordSheet(false);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    }
  };

  const notificationItems = [
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      desc: 'Receive expense alerts via email',
    },
    {
      id: 'budgetAlerts',
      label: 'Budget Alerts',
      desc: 'Get notified when you exceed limits',
    },
    {
      id: 'weeklyReport',
      label: 'Weekly Report',
      desc: 'Spending summary every week',
    },
  ] as const;

  return (
    <div
      className='flex flex-col h-full'
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      {/* ── Sticky header ── */}
      <div
        className='shrink-0 px-4 sm:px-8 py-4 sm:py-5'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
          Settings
        </h1>
        <p className='font-mono text-[10px] text-[#4a4870]'>
          Preferences &amp; account
        </p>
      </div>

      {/* ── Native scroll content ── */}
      <div
        className='flex-1 min-h-0'
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className='px-4 sm:px-6 py-4 space-y-4 pb-8 max-w-2xl mx-auto'>
          {/* ── Account card ── */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <User className='h-3.5 w-3.5 text-[#7c5cfc]' /> Account
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4 space-y-3'>
              {/* Avatar + name row */}
              {user && (
                <div
                  className='flex items-center gap-3 p-3 rounded-xl'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                >
                  <Avatar className='w-12 h-12 rounded-xl shrink-0'>
                    <AvatarFallback
                      className='rounded-xl font-bold text-lg text-[#9d7fff]'
                      style={{
                        background: 'rgba(124,92,252,0.2)',
                        border: '1px solid rgba(124,92,252,0.3)',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='font-sans text-sm font-semibold text-[#f0efff] truncate'>
                      {user.name}
                    </p>
                    <p className='font-mono text-[10px] text-[#4a4870] truncate'>
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    className='shrink-0 font-mono text-[9px] border-0'
                    style={{
                      background: 'rgba(0,255,135,0.1)',
                      color: '#00ff87',
                    }}
                  >
                    {user.role}
                  </Badge>
                </div>
              )}

              {/* Info rows */}
              <div className='space-y-2'>
                {[
                  { label: 'Name', value: user?.name ?? '—' },
                  { label: 'Email', value: user?.email ?? '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='flex items-center justify-between px-3 py-2.5 rounded-xl'
                    style={{ background: 'rgba(8,8,16,0.6)' }}
                  >
                    <span className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                      {label}
                    </span>
                    <span className='font-sans text-sm text-[#f0efff] truncate max-w-[60%] text-right'>
                      {value}
                    </span>
                  </div>
                ))}

                {user?._count && (
                  <div
                    className='flex items-center justify-between px-3 py-2.5 rounded-xl'
                    style={{ background: 'rgba(8,8,16,0.6)' }}
                  >
                    <span className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                      Total Expenses
                    </span>
                    <Badge
                      className='font-mono text-xs border-[rgba(124,92,252,0.2)]'
                      style={{
                        background: 'rgba(8,8,16,0.8)',
                        color: '#f0efff',
                      }}
                    >
                      {user._count.expenses} records
                    </Badge>
                  </div>
                )}
              </div>

              {/* Sign out */}
              <Button
                variant='outline'
                onClick={() => signOut()}
                className='w-full h-11 gap-2 border-red-900/40 text-red-400 hover:bg-red-900/20 hover:text-red-300 font-sans font-medium'
                style={{ background: 'rgba(255,59,92,0.05)' }}
              >
                <LogOut className='h-4 w-4' /> Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* ── Change password ── */}
          {/* Mobile: tap to open bottom sheet */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden sm:hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <button
              className='w-full flex items-center justify-between px-4 py-4'
              onClick={() => setShowPasswordSheet(true)}
            >
              <div className='flex items-center gap-2.5'>
                <div
                  className='w-8 h-8 rounded-lg flex items-center justify-center'
                  style={{
                    background: 'rgba(124,92,252,0.15)',
                    border: '1px solid rgba(124,92,252,0.2)',
                  }}
                >
                  <Lock className='h-3.5 w-3.5 text-[#7c5cfc]' />
                </div>
                <div className='text-left'>
                  <p className='font-sans text-sm font-semibold text-[#f0efff]'>
                    Change Password
                  </p>
                  <p className='font-mono text-[10px] text-[#4a4870]'>
                    Update your account password
                  </p>
                </div>
              </div>
              <ChevronRight className='h-4 w-4 text-[#4a4870]' />
            </button>

            {pwSuccess && (
              <div className='px-4 pb-3'>
                <Alert
                  className='border-green-900/40'
                  style={{ background: 'rgba(0,255,135,0.06)' }}
                >
                  <AlertDescription className='text-[#00ff87] text-sm flex items-center gap-2'>
                    <Check className='h-4 w-4' /> Password updated!
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </Card>

          {/* Desktop: inline card */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden hidden sm:block'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Lock className='h-3.5 w-3.5 text-[#7c5cfc]' /> Change Password
              </CardTitle>
              <CardDescription className='text-[#4a4870] text-xs font-mono'>
                Must be at least 8 characters
              </CardDescription>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4'>
              {pwError && (
                <Alert
                  className='mb-4 border-red-900/40'
                  style={{ background: 'rgba(255,59,92,0.08)' }}
                >
                  <AlertDescription className='text-red-400 text-sm'>
                    {pwError}
                  </AlertDescription>
                </Alert>
              )}
              {pwSuccess && (
                <Alert
                  className='mb-4 border-green-900/40'
                  style={{ background: 'rgba(0,255,135,0.06)' }}
                >
                  <AlertDescription className='text-[#00ff87] text-sm flex items-center gap-2'>
                    <Check className='h-4 w-4' /> Password updated successfully!
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleChangePassword} className='space-y-3'>
                {(
                  [
                    { field: 'currentPassword', label: 'Current Password' },
                    { field: 'newPassword', label: 'New Password' },
                    { field: 'confirmPassword', label: 'Confirm Password' },
                  ] as const
                ).map(({ field, label }) => (
                  <div key={field} className='space-y-1.5'>
                    <Label className='font-mono text-[9px] text-[#4a4870] uppercase tracking-widest'>
                      {label}
                    </Label>
                    <Input
                      type='password'
                      value={pwForm[field]}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, [field]: e.target.value }))
                      }
                      placeholder='••••••••'
                      required
                      className='h-11 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.4)]'
                      style={{ background: 'rgba(8,8,16,0.6)' }}
                    />
                  </div>
                ))}
                <Button
                  type='submit'
                  disabled={isChangingPw}
                  className='w-full h-11 gap-2 text-white font-display font-bold'
                  style={{
                    background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                  }}
                >
                  {isChangingPw ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Lock className='h-4 w-4' />
                  )}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ── Notifications ── */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Bell className='h-3.5 w-3.5 text-[#7c5cfc]' /> Notifications
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4 space-y-2.5'>
              {notificationItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-3 rounded-xl'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                >
                  <div className='space-y-0.5 mr-4 flex-1 min-w-0'>
                    <p className='font-sans text-sm text-[#f0efff]'>
                      {item.label}
                    </p>
                    <p className='font-sans text-xs text-[#4a4870]'>
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    checked={settings[item.id]}
                    onCheckedChange={() => toggle(item.id)}
                    className='data-[state=checked]:bg-[#7c5cfc] shrink-0'
                  />
                </div>
              ))}
              <Button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 2000);
                }}
                className='w-full h-11 gap-2 text-white font-display font-bold mt-1'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                }}
              >
                {settingsSaved ? (
                  <>
                    <Check className='h-4 w-4' /> Saved!
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ── App info ── */}
          <div className='text-center py-2'>
            <p className='font-mono text-[10px] text-[#4a4870]'>
              ExpenseAI · v1.0.0
            </p>
            <p className='font-mono text-[9px] text-[#4a4870] opacity-50 mt-0.5'>
              AI-powered expense tracking
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile: change password bottom sheet ── */}
      <Sheet
        open={showPasswordSheet}
        onOpenChange={(open) => {
          if (!open) {
            setPwError('');
          }
          setShowPasswordSheet(open);
        }}
      >
        <SheetContent
          side='bottom'
          className='rounded-t-3xl'
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(124,92,252,0.2)',
            maxHeight: '90dvh',
            overflowY: 'auto',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          }}
        >
          <SheetHeader className='mb-5'>
            <SheetTitle className='font-display text-[#f0efff]'>
              Change Password
            </SheetTitle>
          </SheetHeader>

          {pwError && (
            <Alert
              className='mb-4 border-red-900/40'
              style={{ background: 'rgba(255,59,92,0.08)' }}
            >
              <AlertDescription className='text-red-400 text-sm'>
                {pwError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className='space-y-4'>
            {(
              [
                { field: 'currentPassword', label: 'Current Password' },
                { field: 'newPassword', label: 'New Password' },
                { field: 'confirmPassword', label: 'Confirm Password' },
              ] as const
            ).map(({ field, label }) => (
              <div key={field} className='space-y-1.5'>
                <Label className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                  {label}
                </Label>
                <Input
                  type='password'
                  value={pwForm[field]}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  placeholder='••••••••'
                  required
                  className='h-12 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.4)]'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                />
              </div>
            ))}
            <Button
              type='submit'
              disabled={isChangingPw}
              className='w-full h-12 gap-2 text-white font-display font-bold mt-2'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
              }}
            >
              {isChangingPw ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Lock className='h-4 w-4' />
              )}
              Update Password
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
