import { useState, useEffect } from 'react';
import {
  Check,
  Loader2,
  User,
  Lock,
  Bell,
  LogOut,
  ChevronRight,
  Pencil,
  X,
  Trash2,
  ShieldAlert,
  BellRing,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import {
  useChangePassword,
  useSignOut,
  useUserSettings,
  useUpdateUserSettings,
  useUpdateProfile,
  useDeleteAccount,
} from '@/services/auth.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES } from '@/api/currency.api';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: signOut } = useSignOut();

  const { data: remoteSettings } = useUserSettings();
  const { mutate: saveSettings, isPending: isSavingSettings } =
    useUpdateUserSettings();

  const [settings, setSettings] = useState(() => {
    if (remoteSettings) {
      return {
        emailNotifications: remoteSettings.emailNotifications,
        budgetAlerts: remoteSettings.budgetAlerts,
        weeklyReport: remoteSettings.weeklyReport,
        currency: remoteSettings.currency,
      };
    }
    return {
      emailNotifications: true,
      budgetAlerts: true,
      weeklyReport: false,
      currency: 'INR',
    };
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(() => {
    if (remoteSettings?.alertThreshold != null) {
      return String(remoteSettings.alertThreshold);
    }
    return '';
  });
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    if (remoteSettings?.monthlyIncome != null) {
      return String(remoteSettings.monthlyIncome);
    }
    return '';
  });

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const { mutate: updateProfile, isPending: isSavingName } = useUpdateProfile();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

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

  const handleSaveNotifications = () => {
    saveSettings(settings, {
      onSuccess: () => {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      },
    });
  };

  const handleSaveCurrency = () => {
    saveSettings(
      { currency: settings.currency },
      {
        onSuccess: () => {
          setSettingsSaved(true);
          setTimeout(() => setSettingsSaved(false), 2500);
        },
      },
    );
  };

  const handleSaveAlerts = () => {
    saveSettings(
      {
        alertThreshold: alertThreshold ? parseFloat(alertThreshold) : null,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined, // NEW
      },
      {
        onSuccess: () => {
          setSettingsSaved(true);
          setTimeout(() => setSettingsSaved(false), 2500);
        },
      },
    );
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
                <User className='h-3.5 w-3.5 text-[#7c5cfc]' /> Profile
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4 space-y-3'>
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

              {/* Editable name */}
              <div
                className='rounded-xl overflow-hidden'
                style={{ background: 'rgba(8,8,16,0.6)' }}
              >
                {editingName ? (
                  <div className='flex items-center gap-2 px-3 py-2'>
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      autoFocus
                      className='h-9 flex-1 bg-[rgba(124,92,252,0.08)] border-[rgba(124,92,252,0.2)] text-[#f0efff] focus-visible:ring-[#7c5cfc] text-sm'
                    />
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-9 w-9 text-[#00ff87] hover:bg-[rgba(0,255,135,0.1)]'
                      disabled={isSavingName}
                      onClick={() => {
                        if (!nameValue.trim() || nameValue.trim().length < 2)
                          return;
                        updateProfile(nameValue.trim(), {
                          onSuccess: () => {
                            setEditingName(false);
                            setNameSaved(true);
                            setTimeout(() => setNameSaved(false), 2500);
                          },
                        });
                      }}
                    >
                      {isSavingName ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Check className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-9 w-9 text-[#4a4870] hover:text-[#8b89b0]'
                      onClick={() => setEditingName(false)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <div className='flex items-center justify-between px-3 py-2.5'>
                    <span className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                      Name
                    </span>
                    <div className='flex items-center gap-2'>
                      {nameSaved && (
                        <Check className='h-3 w-3 text-[#00ff87]' />
                      )}
                      <span className='font-sans text-sm text-[#f0efff]'>
                        {user?.name ?? '—'}
                      </span>
                      <button
                        onClick={() => {
                          setNameValue(user?.name ?? '');
                          setEditingName(true);
                        }}
                        className='ml-1 p-1 rounded-lg text-[#4a4870] hover:text-[#9d7fff] hover:bg-[rgba(124,92,252,0.1)] transition-colors'
                      >
                        <Pencil className='h-3 w-3' />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Static info rows */}
              {[
                { label: 'Email', value: user?.email ?? '—' },
                {
                  label: 'Provider',
                  value:
                    user?.authProvider === 'google' ? '🔵 Google' : '🔑 Email',
                },
                {
                  label: 'Joined',
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—',
                },
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

          {/* ── Change password (mobile tap) ── */}
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

          {/* ── Change password (desktop inline) ── */}
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
                      className='h-11 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30'
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
                onClick={handleSaveNotifications}
                disabled={isSavingSettings}
                className='w-full h-11 gap-2 text-white font-display font-bold mt-1'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                }}
              >
                {isSavingSettings ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : settingsSaved ? (
                  <>
                    <Check className='h-4 w-4' /> Saved!
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ── Currency ── */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <span className='text-[#7c5cfc]'>$</span> Currency
              </CardTitle>
              <CardDescription className='text-[#4a4870] text-xs font-mono'>
                All amounts will display in this currency
              </CardDescription>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4 space-y-3'>
              <div className='space-y-1.5'>
                <Label className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                  Home currency
                </Label>
                <Select
                  value={settings.currency}
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, currency: v }))
                  }
                >
                  <SelectTrigger
                    className='h-11 border-[rgba(124,92,252,0.15)] text-[#f0efff]'
                    style={{ background: 'rgba(8,8,16,0.6)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: '#0d0d1a',
                      border: '1px solid rgba(124,92,252,0.2)',
                      maxHeight: '320px',
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <SelectItem
                        key={c.code}
                        value={c.code}
                        className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'
                      >
                        <span className='font-mono text-xs mr-2 text-[#9d7fff]'>
                          {c.symbol}
                        </span>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveCurrency}
                disabled={isSavingSettings}
                className='w-full h-10 gap-2 text-white font-display font-bold'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                }}
              >
                {isSavingSettings ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : settingsSaved ? (
                  <>
                    <Check className='h-4 w-4' /> Saved!
                  </>
                ) : (
                  'Save Currency'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ── Smart Alerts + Monthly Income — NEW monthlyIncome field ── */}
          <Card
            className='border-[rgba(124,92,252,0.12)] overflow-hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-[#4a4870] uppercase tracking-widest font-normal flex items-center gap-2'>
                <BellRing className='h-3.5 w-3.5 text-[#7c5cfc]' /> Financial
                Preferences
              </CardTitle>
            </CardHeader>
            <Separator className='bg-[rgba(124,92,252,0.1)] mt-3' />
            <CardContent className='p-4 space-y-4'>
              {/* Monthly income — NEW */}
              <div
                className='p-3 rounded-xl'
                style={{ background: 'rgba(8,8,16,0.6)' }}
              >
                <div className='flex items-center gap-2 mb-2'>
                  <Wallet className='h-3.5 w-3.5 text-[#00d4ff]' />
                  <Label className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                    Monthly Income
                  </Label>
                </div>
                <p className='font-sans text-xs text-[#4a4870] mb-2'>
                  Used for zero-based budgeting and financial health score in
                  Finance page
                </p>
                <Input
                  type='number'
                  min='0'
                  step='any'
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder='e.g. 80000'
                  className='h-11 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30'
                  style={{ background: 'rgba(8,8,16,0.8)' }}
                />
              </div>

              {/* Alert threshold */}
              <div
                className='p-3 rounded-xl'
                style={{ background: 'rgba(8,8,16,0.6)' }}
              >
                <div className='flex items-center gap-2 mb-2'>
                  <BellRing className='h-3.5 w-3.5 text-[#ffb830]' />
                  <Label className='font-mono text-[10px] text-[#4a4870] uppercase tracking-widest'>
                    Large Expense Alert
                  </Label>
                </div>
                <p className='font-sans text-xs text-[#4a4870] mb-2'>
                  Get notified when a single expense exceeds this amount (leave
                  empty to disable)
                </p>
                <Input
                  type='number'
                  min='0'
                  step='any'
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder='e.g. 5000'
                  className='h-11 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30'
                  style={{ background: 'rgba(8,8,16,0.8)' }}
                />
              </div>

              <Button
                onClick={handleSaveAlerts}
                disabled={isSavingSettings}
                className='w-full h-10 gap-2 text-white font-display font-bold'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                }}
              >
                {isSavingSettings ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : settingsSaved ? (
                  <>
                    <Check className='h-4 w-4' /> Saved!
                  </>
                ) : (
                  'Save Financial Preferences'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ── Danger zone ── */}
          <Card
            className='border-red-900/30 overflow-hidden'
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <CardHeader className='pb-0 px-4 pt-4'>
              <CardTitle className='text-[10px] font-mono text-red-500/70 uppercase tracking-widest font-normal flex items-center gap-2'>
                <ShieldAlert className='h-3.5 w-3.5' /> Danger Zone
              </CardTitle>
            </CardHeader>
            <Separator className='bg-red-900/20 mt-3' />
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-sans text-sm font-semibold text-[#f0efff]'>
                    Delete Account
                  </p>
                  <p className='font-mono text-[10px] text-[#4a4870] mt-0.5'>
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setDeleteConfirmText('');
                    setShowDeleteDialog(true);
                  }}
                  className='shrink-0 ml-4 border-red-900/40 text-red-400 hover:bg-red-900/20 gap-1.5'
                  style={{ background: 'rgba(255,59,92,0.05)' }}
                >
                  <Trash2 className='h-3.5 w-3.5' /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className='text-center py-2'>
            <p className='font-mono text-[10px] text-[#4a4870]'>
              Spendly · v1.0.0
            </p>
            <p className='font-mono text-[9px] text-[#4a4870] opacity-50 mt-0.5'>
              AI-powered expense tracking
            </p>
          </div>
        </div>
      </div>

      {/* Mobile password sheet */}
      <Sheet
        open={showPasswordSheet}
        onOpenChange={(open) => {
          if (!open) setPwError('');
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
                  className='h-12 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30'
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

      {/* Delete confirm */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(255,59,92,0.2)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className='text-[#f0efff] font-display flex items-center gap-2'>
              <ShieldAlert className='h-5 w-5 text-red-400' /> Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className='text-[#8b89b0] font-mono text-xs space-y-3'>
              <span className='block'>
                This action is{' '}
                <span className='text-red-400 font-semibold'>
                  permanent and irreversible
                </span>
                . All your expenses, budgets, recurring entries, and settings
                will be deleted.
              </span>
              <span className='block mt-3'>
                Type <span className='font-bold text-red-400'>DELETE</span> to
                confirm:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder='Type DELETE to confirm'
            className='h-10 border-red-900/40 text-[#f0efff] focus-visible:ring-red-500/30 font-mono text-sm'
            style={{ background: 'rgba(255,59,92,0.06)' }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              className='border-[rgba(124,92,252,0.2)] text-[#8b89b0]'
              style={{ background: 'rgba(8,8,16,0.6)' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
              onClick={(e) => {
                e.preventDefault();
                deleteAccount();
              }}
              className='gap-2 border-0 text-white'
              style={{
                background:
                  deleteConfirmText === 'DELETE'
                    ? 'rgba(255,59,92,0.8)'
                    : 'rgba(255,59,92,0.2)',
                cursor:
                  deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
              }}
            >
              {isDeletingAccount ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Trash2 className='h-4 w-4' />
              )}
              Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
