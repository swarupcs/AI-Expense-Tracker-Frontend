import { request } from './client';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}
export interface SignInInput {
  email: string;
  password: string;
}
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  googleId?: string;
  googlePicture?: string;
  authProvider?: string;
  emailVerified?: boolean;
  _count?: { expenses: number };
}

export interface UserSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
  onboardingCompleted: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface AuthResult {
  user: PublicUser;
  tokens: TokenPair;
}

export const authApi = {
  signUp: (data: SignUpInput) =>
    request<AuthResult>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signIn: (data: SignInInput) =>
    request<AuthResult>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signOut: (refreshToken: string) =>
    request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  getMe: () => request<PublicUser>('/auth/me'),
  changePassword: (data: ChangePasswordInput) =>
    request<void>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Google OAuth
  getGoogleAuthUrl: () => request<{ url: string }>('/auth/google'),
  googleCallback: (code: string) =>
    request<AuthResult>('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  googleTokenAuth: (idToken: string) =>
    request<AuthResult>('/auth/google/token', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  // Password reset
  forgotPassword: (email: string) =>
    request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    }),

  // Email verification
  verifyEmail: (token: string) =>
    request<void>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  resendVerification: (email: string) =>
    request<void>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // User settings
  getUserSettings: () => request<UserSettings>('/user/settings'),
  updateUserSettings: (data: Partial<UserSettings>) =>
    request<UserSettings>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Profile
  updateProfile: (name: string) =>
    request<PublicUser>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  deleteAccount: () =>
    request<void>('/user', { method: 'DELETE' }),
};
