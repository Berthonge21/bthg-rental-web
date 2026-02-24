import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CurrentUser, AuthResponse } from '@berthonge21/sdk';
import { api } from '@/lib/api';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  setUser: (user: CurrentUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstname: string;
    name: string;
    email: string;
    password: string;
    telephone: string;
    numPermis: string;
    address: string;
    city: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deactivateAccount: () => Promise<void>;
  reactivateAccount: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          let response: AuthResponse;
          try {
            // 1st attempt: client table
            response = await api.auth.login({ email, password });
          } catch (clientErr: unknown) {
            // Re-throw 403 (account deactivated) immediately — no point trying admin
            // ApiError uses .statusCode (not .status)
            const statusCode = (clientErr as { statusCode?: number })?.statusCode;
            if (statusCode === 403) throw clientErr;
            // 2nd attempt: agency/admin table
            try {
              response = await api.auth.loginAdmin({ email, password });
            } catch {
              // Both failed — surface the original client error so deactivation
              // messages are preserved correctly
              throw clientErr;
            }
          }
          await api.setTokens(response.accessToken, response.refreshToken);
          set({ user: response.user as unknown as CurrentUser, isAuthenticated: true, isLoading: false });
          api.auth.me().then((u: CurrentUser) => set({ user: u })).catch(() => {});
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // Backend returns { message, user } — no tokens issued at registration
          await api.auth.register(data);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch {
          // Ignore logout errors
        } finally {
          await api.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      deactivateAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.users.deactivateAccount();
          // Clear auth state after successful deactivation
          try {
            await api.auth.logout();
          } catch {
            // Ignore logout errors during deactivation
          }
          await api.clearTokens();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to deactivate account';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      reactivateAccount: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.reactivateAccount({ email, password });
          await api.setTokens(response.accessToken, response.refreshToken);

          const user = await api.auth.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reactivate account';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      fetchUser: async () => {
        const state = get();

        // Fast path: already have cached user data — render immediately,
        // validate token silently in the background
        if (state.isAuthenticated && state.user) {
          set({ isInitializing: false });
          api.auth.me()
            .then((user: CurrentUser) => set({ user, isAuthenticated: true }))
            .catch(() => {
              // Don't clearTokens — a concurrent login may have just set fresh tokens.
              // The next protected call will trigger re-auth naturally.
              set({ user: null, isAuthenticated: false });
            });
          return;
        }

        // Slow path: no cached data — check token then call /auth/me
        const isAuth = await api.isAuthenticated();
        if (!isAuth) {
          set({ user: null, isAuthenticated: false, isInitializing: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await api.auth.me();
          set({ user, isAuthenticated: true, isLoading: false, isInitializing: false });
        } catch {
          await api.clearTokens();
          set({ user: null, isAuthenticated: false, isLoading: false, isInitializing: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bthg-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
