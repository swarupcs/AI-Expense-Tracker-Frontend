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
    } catch (err: any) {
      setPwError(err.message ?? 'Failed to change password');
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
    <div className='flex flex-col h-full bg-[--background]'>
      {/* Header */}
      <div className='shrink-0 border-b border-[#1c1c22] bg-[#0a0a0c] px-8 py-6'>
        <h1 className='font-display text-2xl font-bold text-[--foreground]'>
          Settings
        </h1>
        <p className='text-sm text-[--foreground-secondary] mt-0.5 font-mono'>
          Preferences &amp; account
        </p>
      </div>

      <ScrollArea className='flex-1'>
        <div className='px-8 py-6 space-y-6 max-w-2xl'>
          {/* Account card */}
          <Card className='bg-[#0f0f12] border-[#1c1c22]'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal flex items-center gap-2'>
                <User className='h-4 w-4 text-[--primary]' /> Account
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[#1c1c22]' />
            <CardContent className='pt-5 space-y-3'>
              {user && (
                <div className='flex items-center gap-3 p-3 rounded-lg bg-[#111114]'>
                  <Avatar className='w-10 h-10 rounded-xl shrink-0'>
                    <AvatarFallback className='rounded-xl bg-[--primary]/20 border border-[--primary]/30 text-[--primary] font-bold'>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-[--foreground] truncate'>
                      {user.name}
                    </p>
                    <p className='text-xs text-[--foreground-secondary] truncate font-mono'>
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='border-green-900/40 bg-[#0f1a10] text-green-400 text-[9px] font-mono shrink-0'
                  >
                    {user.role}
                  </Badge>
                </div>
              )}

              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 rounded-lg bg-[#111114]'>
                  <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest mb-1'>
                    Name
                  </p>
                  <p className='text-sm text-[--foreground]'>
                    {user?.name ?? '—'}
                  </p>
                </div>
                <div className='p-3 rounded-lg bg-[#111114]'>
                  <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest mb-1'>
                    Email
                  </p>
                  <p className='text-sm text-[--foreground] truncate'>
                    {user?.email ?? '—'}
                  </p>
                </div>
              </div>

              {user?._count && (
                <div className='p-3 rounded-lg bg-[#111114] flex items-center justify-between'>
                  <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                    Total Expenses
                  </p>
                  <Badge
                    variant='outline'
                    className='border-[#1c1c22] bg-[#0a0a0c] text-[--foreground] font-mono text-xs'
                  >
                    {user._count.expenses} records
                  </Badge>
                </div>
              )}

              <Button
                variant='outline'
                onClick={() => signOut()}
                className='w-full gap-2 border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 hover:border-red-900/60'
              >
                <LogOut className='h-4 w-4' />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Change password card */}
          <Card className='bg-[#0f0f12] border-[#1c1c22]'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Lock className='h-4 w-4 text-[--primary]' /> Change Password
              </CardTitle>
              <CardDescription className='text-[--foreground-secondary] text-xs font-mono'>
                Must be at least 8 characters
              </CardDescription>
            </CardHeader>
            <Separator className='bg-[#1c1c22]' />
            <CardContent className='pt-5'>
              {pwError && (
                <Alert className='mb-4 border-red-900/40 bg-red-950/20'>
                  <AlertDescription className='text-red-400 text-sm'>
                    {pwError}
                  </AlertDescription>
                </Alert>
              )}
              {pwSuccess && (
                <Alert className='mb-4 border-green-900/40 bg-green-950/10'>
                  <AlertDescription className='text-green-400 text-sm flex items-center gap-2'>
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
                    <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
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
                      className='bg-[#111114] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30'
                    />
                  </div>
                ))}
                <Button
                  type='submit'
                  disabled={isChangingPw}
                  className='w-full gap-2 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90 disabled:opacity-50 mt-2'
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
          <Card className='bg-[#0f0f12] border-[#1c1c22]'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-mono text-[--foreground-secondary] uppercase tracking-widest font-normal flex items-center gap-2'>
                <Bell className='h-4 w-4 text-[--primary]' /> Notifications
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[#1c1c22]' />
            <CardContent className='pt-5 space-y-3'>
              {notificationItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-[#111114]'
                >
                  <div className='space-y-0.5'>
                    <p className='text-sm text-[--foreground]'>{item.label}</p>
                    <p className='text-xs text-[--foreground-secondary]'>
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    checked={settings[item.id]}
                    onCheckedChange={() => toggle(item.id)}
                    className='data-[state=checked]:bg-[--primary]'
                  />
                </div>
              ))}

              <Button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 2000);
                }}
                className='w-full gap-2 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90 mt-2'
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
