import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface User {
  id: string;
  phone: string;
  name?: string | null;
  state?: string | null;
  district?: string | null;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoggedIn: false,
        isLoading: false,

        setUser: (user) => set({ user, isLoggedIn: true }, false, "setUser"),

        clearUser: () => set({ user: null, isLoggedIn: false }, false, "clearUser"),

        setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

        logout: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          set({ user: null, isLoggedIn: false }, false, "logout");
        },
      }),
      {
        name: "sarkar-auth",
        // Only persist user data, not loading state
        partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
      }
    ),
    { name: "AuthStore" }
  )
);
