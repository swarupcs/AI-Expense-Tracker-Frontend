import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenStorage } from '@/api/client';
import { authApi, type PublicUser } from '@/api/auth.api';

interface AuthState {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  login: (user: PublicUser, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setUser: (user: PublicUser) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, accessToken, refreshToken) => {
        tokenStorage.set(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        const refreshToken = tokenStorage.getRefresh();
        if (refreshToken) {
          authApi.signOut(refreshToken).catch(() => {});
        }
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      hydrate: async () => {
        const token = tokenStorage.getAccess();
        if (!token || get().isAuthenticated) return;

        set({ isLoading: true });
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            set({ user: res.data, isAuthenticated: true });
          } else {
            tokenStorage.clear();
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
