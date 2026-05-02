import { useState } from 'react';
import { useAdminUsers, useGlobalSettings, useUpdateGlobalSettings, useUpdateUserSettings } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, User, MessageSquare, PieChart, Activity, Settings2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AVAILABLE_PROVIDERS = ['gemini', 'openai', 'groq', 'vertex', 'custom'];

export default function AdminPage() {
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: globalSettings, isLoading: settingsLoading } = useGlobalSettings();
  const updateGlobal = useUpdateGlobalSettings();
  const updateUser = useUpdateUserSettings();

  const [globalProvider, setGlobalProvider] = useState<string>('');
  const [globalModel, setGlobalModel] = useState<string>('');
  const [userEdits, setUserEdits] = useState<Record<number, { llmProvider: string, llmModel: string }>>({});

  // Sync state when data loads
  if (globalSettings && !globalProvider && !settingsLoading) {
    setGlobalProvider(globalSettings.llmProvider);
    setGlobalModel(globalSettings.llmModel || '');
  }

  const handleGlobalSave = () => {
    updateGlobal.mutate({ llmProvider: globalProvider, llmModel: globalModel });
  };

  const handleUserSave = (userId: number) => {
    const edit = userEdits[userId];
    if (!edit) return;
    
    updateUser.mutate({
      userId,
      data: {
        llmProvider: edit.llmProvider === 'default' ? null : edit.llmProvider,
        llmModel: edit.llmModel || null,
      }
    });
  };

  if (usersLoading || settingsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="w-8 h-8 text-[--violet-bright] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#080810', overflow: 'hidden' }}>
      <div className="shrink-0 px-4 sm:px-8 py-5 border-b border-[rgba(124,92,252,0.1)] bg-[rgba(8,8,16,0.95)] backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-[#ff3b5c]" />
          <h1 className="font-display text-2xl font-extrabold text-[#f0efff] tracking-tight">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Global Settings */}
        <Card style={{ background: 'rgba(13,13,26,0.7)', border: '1px solid rgba(124,92,252,0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f0efff]">
              <Settings2 className="w-5 h-5 text-[#00d4ff]" />
              Global LLM Settings
            </CardTitle>
            <CardDescription className="text-[#8b89b0]">
              These settings apply to all users unless they have a specific override.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#4a4870] uppercase mb-1">Provider</label>
                <select
                  value={globalProvider}
                  onChange={(e) => setGlobalProvider(e.target.value)}
                  className="w-full bg-[#0d0d1a] border border-[rgba(124,92,252,0.2)] rounded-lg px-3 py-2 text-sm text-[#f0efff]"
                >
                  {AVAILABLE_PROVIDERS.map(p => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#4a4870] uppercase mb-1">Model (Optional)</label>
                <input
                  type="text"
                  value={globalModel}
                  onChange={(e) => setGlobalModel(e.target.value)}
                  placeholder="e.g. gpt-4o"
                  className="w-full bg-[#0d0d1a] border border-[rgba(124,92,252,0.2)] rounded-lg px-3 py-2 text-sm text-[#f0efff]"
                />
              </div>
            </div>
            <Button
              onClick={handleGlobalSave}
              disabled={updateGlobal.isPending}
              className="bg-[#7c5cfc] hover:bg-[#9d7fff] text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Save Global Settings
            </Button>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card style={{ background: 'rgba(13,13,26,0.7)', border: '1px solid rgba(124,92,252,0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f0efff]">
              <User className="w-5 h-5 text-[#ffb830]" />
              Users & Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#f0efff]">
                <thead className="bg-[rgba(124,92,252,0.08)] text-[#8b89b0] font-mono text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-center">Usage</th>
                    <th className="px-4 py-3 rounded-tr-lg w-64">LLM Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(124,92,252,0.1)]">
                  {users?.map(user => {
                    const edit = userEdits[user.id] || { 
                      llmProvider: user.settings?.llmProvider || 'default', 
                      llmModel: user.settings?.llmModel || '' 
                    };
                    const hasChanges = userEdits[user.id] !== undefined;

                    return (
                      <tr key={user.id} className="hover:bg-[rgba(124,92,252,0.03)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-xs text-[#8b89b0]">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${user.role === 'ADMIN' ? 'bg-[#ff3b5c]/20 text-[#ff3b5c]' : 'bg-[#00d4ff]/20 text-[#00d4ff]'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#8b89b0] text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3 text-xs font-mono text-[#8b89b0]">
                            <div className="flex items-center gap-1" title="Expenses">
                              <PieChart className="w-3.5 h-3.5 text-[#00ff87]" /> {user._count.expenses}
                            </div>
                            <div className="flex items-center gap-1" title="AI Messages">
                              <MessageSquare className="w-3.5 h-3.5 text-[#7c5cfc]" /> {user._count.chatMessages}
                            </div>
                            <div className="flex items-center gap-1" title="Tool Calls">
                              <Activity className="w-3.5 h-3.5 text-[#ffb830]" /> {user._count.toolCallLogs}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <select
                              value={edit.llmProvider}
                              onChange={(e) => setUserEdits(prev => ({ ...prev, [user.id]: { ...edit, llmProvider: e.target.value } }))}
                              className="w-full bg-[#0d0d1a] border border-[rgba(124,92,252,0.2)] rounded px-2 py-1 text-xs"
                            >
                              <option value="default">Global Default</option>
                              {AVAILABLE_PROVIDERS.map(p => (
                                <option key={p} value={p}>{p.toUpperCase()}</option>
                              ))}
                            </select>
                            {edit.llmProvider !== 'default' && (
                              <input
                                type="text"
                                placeholder="Model override (optional)"
                                value={edit.llmModel}
                                onChange={(e) => setUserEdits(prev => ({ ...prev, [user.id]: { ...edit, llmModel: e.target.value } }))}
                                className="w-full bg-[#0d0d1a] border border-[rgba(124,92,252,0.2)] rounded px-2 py-1 text-xs"
                              />
                            )}
                            {hasChanges && (
                              <Button
                                size="sm"
                                onClick={() => handleUserSave(user.id)}
                                disabled={updateUser.isPending}
                                className="h-6 text-[10px] w-full"
                              >
                                Save User
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
