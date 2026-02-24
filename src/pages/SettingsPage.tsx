import { useState } from 'react';
import { Check, Loader2, User, Lock, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useChangePassword, useSignOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: signOut } = useSignOut();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReport: false,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
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
    <div className='flex flex-col h-full' style={{ background: '#080810' }}>
      {/* Header */}
      <div
        className='shrink-0 px-4 sm:px-8 py-4 sm:py-6'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <h1 className='font-display text-xl sm:text-2xl font-extrabold text-[#f0efff] tracking-tight'>
          Settings
        </h1>
        <p className='font-mono text-[10px] sm:text-[11px] text-[#4a4870]'>
          Preferences &amp; account
        </p>
      </div>

      <ScrollArea className='flex-1'>
        <div className='px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 max-w-2xl'>
          {/* Account card */}
          <Card
            className='border-[rgba(124,92,252,0.12)]'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-2 px-4 sm:px-6 pt-4 sm:pt-5'>
              <CardTitle className='text-[10px] sm:text-[11px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <User className='h-3.5 w-3.5 text-[#7c5cfc]' /> Account
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)]' />
            <CardContent className='pt-4 sm:pt-5 px-4 sm:px-6 pb-4 sm:pb-5 space-y-3'>
              {user && (
                <div
                  className='flex items-center gap-3 p-3 rounded-xl'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                >
                  <Avatar className='w-10 h-10 rounded-xl shrink-0'>
                    <AvatarFallback
                      className='rounded-xl font-bold text-[#9d7fff]'
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

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {[
                  { label: 'Name', value: user?.name ?? '—' },
                  { label: 'Email', value: user?.email ?? '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='p-3 rounded-xl'
                    style={{ background: 'rgba(8,8,16,0.6)' }}
                  >
                    <p className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest mb-1'>
                      {label}
                    </p>
                    <p className='font-sans text-sm text-[#f0efff] truncate'>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {user?._count && (
                <div
                  className='flex items-center justify-between p-3 rounded-xl'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                >
                  <p className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest'>
                    Total Expenses
                  </p>
                  <Badge
                    className='font-mono text-xs border-[rgba(124,92,252,0.2)]'
                    style={{ background: 'rgba(8,8,16,0.8)', color: '#f0efff' }}
                  >
                    {user._count.expenses} records
                  </Badge>
                </div>
              )}

              <Button
                variant='outline'
                onClick={() => signOut()}
                className='w-full gap-2 border-red-900/40 text-red-400 hover:bg-red-900/20 hover:text-red-300'
                style={{ background: 'rgba(255,59,92,0.05)' }}
              >
                <LogOut className='h-4 w-4' /> Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Change password card */}
          <Card
            className='border-[rgba(124,92,252,0.12)]'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-2 px-4 sm:px-6 pt-4 sm:pt-5'>
              <CardTitle className='text-[10px] sm:text-[11px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Lock className='h-3.5 w-3.5 text-[#7c5cfc]' /> Change Password
              </CardTitle>
              <CardDescription className='text-[#4a4870] text-xs font-mono'>
                Must be at least 8 characters
              </CardDescription>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)]' />
            <CardContent className='pt-4 sm:pt-5 px-4 sm:px-6 pb-4 sm:pb-5'>
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
                  <div key={field} className='space-y-2'>
                    <Label className='font-mono text-[9px] sm:text-[10px] text-[#4a4870] uppercase tracking-widest'>
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
                      className='border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 focus-visible:border-[rgba(124,92,252,0.4)]'
                      style={{ background: 'rgba(8,8,16,0.6)' }}
                    />
                  </div>
                ))}
                <Button
                  type='submit'
                  disabled={isChangingPw}
                  className='w-full gap-2 text-white font-display font-bold mt-1'
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

          {/* Notifications card */}
          <Card
            className='border-[rgba(124,92,252,0.12)]'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-2 px-4 sm:px-6 pt-4 sm:pt-5'>
              <CardTitle className='text-[10px] sm:text-[11px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Bell className='h-3.5 w-3.5 text-[#7c5cfc]' /> Notifications
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)]' />
            <CardContent className='pt-4 sm:pt-5 px-4 sm:px-6 pb-4 sm:pb-5 space-y-3'>
              {notificationItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-3 rounded-xl'
                  style={{ background: 'rgba(8,8,16,0.6)' }}
                >
                  <div className='space-y-0.5 mr-4'>
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
                className='w-full gap-2 text-white font-display font-bold'
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
        </div>
      </ScrollArea>
    </div>
  );
}
