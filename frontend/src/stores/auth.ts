import { create } from "zustand";
import {
  apiGet,
  apiPost,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type MeResponse,
} from "@/lib/utils";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await apiPost<LoginResponse>("/auth/login", credentials);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      get().clearAuth();
    }
  },

  refreshAccessToken: async () => {
    try {
      await apiPost("/auth/refresh", {});
      // Token refresh is handled by cookies, just check auth status
      await get().checkAuth();
    } catch (error) {
      console.error("Token refresh failed:", error);
      get().clearAuth();
      throw error;
    }
  },

  setUser: (user: AuthUser | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    try {
      const response = await apiGet<MeResponse>("/auth/me");
      set({
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      get().clearAuth();
    }
  },
}));

// Auto-refresh token every 25 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    const { refreshAccessToken, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      refreshAccessToken().catch((error) => {
        console.error("Auto refresh failed:", error);
      });
    }
  }, 25 * 60 * 1000);
}

// Initialize auth state on app start
if (typeof window !== "undefined") {
  // Check authentication status on app start
  useAuthStore.getState().checkAuth();
}
