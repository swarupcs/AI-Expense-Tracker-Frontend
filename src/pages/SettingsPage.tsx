import { useState } from 'react';
import {
  Check,
  Loader2,
  User,
  Lock,
  Bell,
  LogOut,
  Pencil,
  X,
  Trash2,
  ShieldAlert,
  BellRing,
  Wallet,
  Settings2,
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

  const handleSavePreferences = () => {
    saveSettings(
      {
        ...settings,
        alertThreshold: alertThreshold ? parseFloat(alertThreshold) : null,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      },
      {
        onSuccess: () => {
          setSettingsSaved(true);
          setTimeout(() => setSettingsSaved(false), 2500);
        },
      }
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
      className="flex flex-col h-full"
      style={{ background: '#080810', overflow: 'hidden' }}
    >
      <div
        className="shrink-0 px-4 sm:px-8 py-6 sm:py-8"
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.2)]">
            <Settings2 className="h-5 w-5 text-[#7c5cfc]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#f0efff] tracking-tight">
              Settings
            </h1>
            <p className="font-mono text-xs text-[#8b89b0] mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex-1 min-h-0"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 bg-[rgba(13,13,26,0.6)] border border-[rgba(124,92,252,0.1)] p-1 rounded-xl overflow-x-auto flex-nowrap w-full justify-start sm:w-fit scrollbar-hide">
              <TabsTrigger
                value="profile"
                className="rounded-lg data-[state=active]:bg-[rgba(124,92,252,0.15)] data-[state=active]:text-[#f0efff] text-[#8b89b0] font-sans h-9 px-4 whitespace-nowrap gap-2"
              >
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="rounded-lg data-[state=active]:bg-[rgba(124,92,252,0.15)] data-[state=active]:text-[#f0efff] text-[#8b89b0] font-sans h-9 px-4 whitespace-nowrap gap-2"
              >
                <BellRing className="h-4 w-4" /> Preferences
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg data-[state=active]:bg-[rgba(124,92,252,0.15)] data-[state=active]:text-[#f0efff] text-[#8b89b0] font-sans h-9 px-4 whitespace-nowrap gap-2"
              >
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6 focus-visible:outline-none outline-none">
              <div className="bg-[rgba(13,13,26,0.6)] border border-[rgba(124,92,252,0.12)] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                  {user && (
                    <Avatar className="w-20 h-20 rounded-2xl shrink-0 shadow-lg">
                      <AvatarFallback
                        className="rounded-2xl font-bold text-3xl text-[#9d7fff]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(0,212,255,0.1))',
                          border: '1px solid rgba(124,92,252,0.3)',
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 space-y-3">
                    {editingName ? (
                      <div className="flex items-center gap-2 max-w-sm">
                        <Input
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          autoFocus
                          className="h-10 flex-1 bg-[rgba(8,8,16,0.6)] border-[rgba(124,92,252,0.2)] text-[#f0efff] focus-visible:ring-[#7c5cfc] text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 text-[#00ff87] hover:bg-[rgba(0,255,135,0.1)] bg-[rgba(0,255,135,0.05)]"
                          disabled={isSavingName}
                          onClick={() => {
                            if (!nameValue.trim() || nameValue.trim().length < 2) return;
                            updateProfile(nameValue.trim(), {
                              onSuccess: () => {
                                setEditingName(false);
                                setNameSaved(true);
                                setTimeout(() => setNameSaved(false), 2500);
                              },
                            });
                          }}
                        >
                          {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 text-[#ff3b5c] hover:bg-[rgba(255,59,92,0.1)] bg-[rgba(255,59,92,0.05)]"
                          onClick={() => setEditingName(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="font-sans text-2xl font-bold text-[#f0efff]">
                          {user?.name}
                        </h2>
                        <button
                          onClick={() => {
                            setNameValue(user?.name ?? '');
                            setEditingName(true);
                          }}
                          className="p-1.5 rounded-lg text-[#4a4870] hover:text-[#9d7fff] hover:bg-[rgba(124,92,252,0.1)] transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {nameSaved && <Check className="h-4 w-4 text-[#00ff87]" />}
                      </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-mono text-sm text-[#8b89b0]">{user?.email}</p>
                      <Badge
                        className="font-mono text-[10px] border-0 px-2 py-0.5"
                        style={{ background: 'rgba(0,255,135,0.1)', color: '#00ff87' }}
                      >
                        {user?.role?.toUpperCase()}
                      </Badge>
                      <Badge
                        className="font-mono text-[10px] border-0 px-2 py-0.5"
                        style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}
                      >
                        {user?.authProvider === 'google' ? 'GOOGLE' : 'EMAIL'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[rgba(8,8,16,0.6)] border border-[rgba(124,92,252,0.08)]">
                    <p className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest mb-1">Joined On</p>
                    <p className="font-sans text-[#f0efff]">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(8,8,16,0.6)] border border-[rgba(124,92,252,0.08)]">
                    <p className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest mb-1">Status</p>
                    <p className="font-sans text-[#00ff87] flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff87]"></span>
                      </span>
                      Active
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="flex-1 h-12 gap-2 border-[rgba(124,92,252,0.2)] text-[#f0efff] hover:bg-[rgba(124,92,252,0.1)] hover:text-white font-sans font-medium"
                    style={{ background: 'rgba(8,8,16,0.6)' }}
                  >
                    <LogOut className="h-4 w-4 text-[#7c5cfc]" /> Sign Out
                  </Button>
                </div>
              </div>

              <div className="bg-[rgba(255,59,92,0.02)] border border-[rgba(255,59,92,0.15)] rounded-2xl p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-red-400 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" /> Danger Zone
                    </h3>
                    <p className="font-sans text-sm text-[#8b89b0] mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setShowDeleteDialog(true);
                    }}
                    className="shrink-0 h-10 gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* PREFERENCES TAB */}
            <TabsContent value="preferences" className="space-y-6 focus-visible:outline-none outline-none">
              <div className="bg-[rgba(13,13,26,0.6)] border border-[rgba(124,92,252,0.12)] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
                <h3 className="font-sans text-lg font-semibold text-[#f0efff] flex items-center gap-2 mb-6">
                  <Settings2 className="h-5 w-5 text-[#7c5cfc]" /> Regional & Financial
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest flex items-center gap-2">
                        <Wallet className="h-3 w-3 text-[#00d4ff]" /> Home Currency
                      </Label>
                      <Select
                        value={settings.currency}
                        onValueChange={(v) => setSettings((p) => ({ ...p, currency: v }))}
                      >
                        <SelectTrigger
                          className="h-12 border-[rgba(124,92,252,0.15)] text-[#f0efff] bg-[rgba(8,8,16,0.6)] rounded-xl"
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
                              className="text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]"
                            >
                              <span className="font-mono text-xs mr-2 text-[#9d7fff]">{c.symbol}</span>
                              {c.code} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="font-sans text-xs text-[#4a4870]">
                        All amounts will display in this currency.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest flex items-center gap-2">
                        <BellRing className="h-3 w-3 text-[#ffb830]" /> Large Expense Alert
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(e.target.value)}
                        placeholder="e.g. 5000"
                        className="h-12 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 bg-[rgba(8,8,16,0.6)] rounded-xl"
                      />
                      <p className="font-sans text-xs text-[#4a4870]">
                        Threshold for large single expense alerts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest flex items-center gap-2">
                      <Wallet className="h-3 w-3 text-[#00ff87]" /> Monthly Income
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="e.g. 80000"
                      className="h-12 max-w-sm border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 bg-[rgba(8,8,16,0.6)] rounded-xl"
                    />
                    <p className="font-sans text-xs text-[#4a4870]">
                      Used for zero-based budgeting and financial health score.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(13,13,26,0.6)] border border-[rgba(124,92,252,0.12)] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
                <h3 className="font-sans text-lg font-semibold text-[#f0efff] flex items-center gap-2 mb-6">
                  <Bell className="h-5 w-5 text-[#7c5cfc]" /> Notifications
                </h3>
                <div className="space-y-4">
                  {notificationItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-[rgba(124,92,252,0.08)] bg-[rgba(8,8,16,0.6)]"
                    >
                      <div className="space-y-1 mr-4 flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[#f0efff]">
                          {item.label}
                        </p>
                        <p className="font-sans text-xs text-[#8b89b0]">
                          {item.desc}
                        </p>
                      </div>
                      <Switch
                        checked={settings[item.id]}
                        onCheckedChange={() => toggle(item.id)}
                        className="data-[state=checked]:bg-[#7c5cfc] shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={isSavingSettings}
                className="w-full sm:w-auto h-12 px-8 gap-2 text-white font-display font-bold rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                  boxShadow: '0 4px 20px rgba(124,92,252,0.3)',
                }}
              >
                {isSavingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : settingsSaved ? (
                  <>
                    <Check className="h-4 w-4" /> Saved Successfully!
                  </>
                ) : (
                  'Save All Preferences'
                )}
              </Button>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="space-y-6 focus-visible:outline-none outline-none">
              <div className="bg-[rgba(13,13,26,0.6)] border border-[rgba(124,92,252,0.12)] rounded-2xl p-4 sm:p-6 backdrop-blur-xl max-w-xl">
                <h3 className="font-sans text-lg font-semibold text-[#f0efff] flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-[#7c5cfc]" /> Change Password
                </h3>
                <p className="font-sans text-sm text-[#8b89b0] mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>

                {pwError && (
                  <Alert className="mb-6 border-red-900/40 bg-[rgba(255,59,92,0.08)]">
                    <AlertDescription className="text-red-400 text-sm">{pwError}</AlertDescription>
                  </Alert>
                )}
                {pwSuccess && (
                  <Alert className="mb-6 border-green-900/40 bg-[rgba(0,255,135,0.06)]">
                    <AlertDescription className="text-[#00ff87] text-sm flex items-center gap-2">
                      <Check className="h-4 w-4" /> Password updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {(
                    [
                      { field: 'currentPassword', label: 'Current Password' },
                      { field: 'newPassword', label: 'New Password' },
                      { field: 'confirmPassword', label: 'Confirm Password' },
                    ] as const
                  ).map(({ field, label }) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="font-mono text-[10px] text-[#4a4870] uppercase tracking-widest">
                        {label}
                      </Label>
                      <Input
                        type="password"
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder="••••••••"
                        required
                        className="h-12 border-[rgba(124,92,252,0.15)] text-[#f0efff] focus-visible:ring-[#7c5cfc]/30 bg-[rgba(8,8,16,0.6)] rounded-xl"
                      />
                    </div>
                  ))}
                  <Button
                    type="submit"
                    disabled={isChangingPw}
                    className="w-full sm:w-auto mt-4 h-12 px-8 gap-2 text-white font-display font-bold rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                    }}
                  >
                    {isChangingPw ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Update Password
                  </Button>
                </form>
              </div>
            </TabsContent>

          </Tabs>

          <div className="text-center py-10 mt-8 border-t border-[rgba(124,92,252,0.1)]">
            <p className="font-mono text-xs text-[#8b89b0]">Spendly · v1.0.0</p>
            <p className="font-mono text-[10px] text-[#4a4870] opacity-70 mt-1">AI-powered expense tracking</p>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          style={{ background: '#0d0d1a', border: '1px solid rgba(255,59,92,0.2)' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f0efff] font-display flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" /> Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8b89b0] font-sans text-sm space-y-3">
              <span className="block">
                This action is <span className="text-red-400 font-semibold">permanent and irreversible</span>. All your expenses, budgets, recurring entries, and settings will be deleted.
              </span>
              <span className="block mt-3">
                Type <span className="font-bold text-red-400">DELETE</span> to confirm:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="h-11 border-red-900/40 text-[#f0efff] focus-visible:ring-red-500/30 font-mono text-sm bg-[rgba(255,59,92,0.06)]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[rgba(124,92,252,0.2)] text-[#8b89b0] bg-[rgba(8,8,16,0.6)] hover:bg-[rgba(8,8,16,0.8)] hover:text-[#f0efff]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
              onClick={(e) => {
                e.preventDefault();
                deleteAccount();
              }}
              className="gap-2 border-0 text-white"
              style={{
                background: deleteConfirmText === 'DELETE' ? 'rgba(255,59,92,0.8)' : 'rgba(255,59,92,0.2)',
                cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
              }}
            >
              {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}