import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  authApi,
  type SignUpInput,
  type SignInInput,
  type ChangePasswordInput,
  type UserSettings,
} from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export const authKeys = { me: ['auth', 'me'] as const };

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await authApi.getMe();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to fetch user');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSignUp() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const res = await authApi.signUp(data);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Sign up failed');
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/');
    },
  });
}

export function useSignIn() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: SignInInput) => {
      const res = await authApi.signIn(data);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Sign in failed');
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/');
    },
  });
}

export function useSignOut() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const res = await authApi.changePassword(data);
      if (!res.success)
        throw new Error(res.error ?? 'Failed to change password');
      return res;
    },
  });
}



// ─── Google OAuth Hooks ───────────────────────────────────────────────────────

export function useGoogleAuth() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await authApi.googleCallback(code);
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Google authentication failed');
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/');
    },
  });
}

export function useGoogleAuthUrl() {
  return useQuery({
    queryKey: ['google-auth-url'],
    queryFn: async () => {
      const res = await authApi.getGoogleAuthUrl();
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Failed to get Google auth URL');
      return res.data.url;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Password Reset Hooks ─────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await authApi.forgotPassword(email);
      if (!res.success) throw new Error(res.error ?? 'Request failed');
      return res;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      token,
      newPassword,
      confirmPassword,
    }: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const res = await authApi.resetPassword(token, newPassword, confirmPassword);
      if (!res.success) throw new Error(res.error ?? 'Reset failed');
      return res;
    },
  });
}

// ─── Email Verification Hooks ─────────────────────────────────────────────────

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await authApi.verifyEmail(token);
      if (!res.success) throw new Error(res.error ?? 'Verification failed');
      return res;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await authApi.resendVerification(email);
      if (!res.success) throw new Error(res.error ?? 'Request failed');
      return res;
    },
  });
}

// ─── User Settings Hooks ──────────────────────────────────────────────────────

export function useUserSettings() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      const res = await authApi.getUserSettings();
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load settings');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const res = await authApi.updateUserSettings(data);
      if (!res.success) throw new Error(res.error ?? 'Failed to save settings');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'settings'], data);
    },
  });
}

// Handle Google OAuth callback
export function useGoogleCallback() {
  const [searchParams] = useSearchParams();
  const { mutate: googleAuth } = useGoogleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (code) {
      googleAuth(code);
    }
  }, [searchParams, googleAuth, navigate]);
}