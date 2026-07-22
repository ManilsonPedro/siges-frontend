import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/shared/types";
import { authService } from "@/shared/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const tokens = await authService.login(email, password);
          authService.saveTokens(tokens);
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          authService.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      loadUser: async () => {
        if (!authService.isAuthenticated()) return;
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          authService.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
