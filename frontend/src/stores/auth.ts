import { create } from "zustand";
import {
  apiGetClient,
  apiPostClient,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type MeResponse,
} from "@/lib/utils";
import { getClientToken } from "@/lib/client-token";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentTenantSlug: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  setCurrentTenant: (tenantSlug: string | null) => void;
  getCurrentTenant: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true, // Start as true to show loading initially
  isAuthenticated: false,
  currentTenantSlug: null,
  isInitialized: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await apiPostClient<LoginResponse>(
        "/auth/login",
        credentials
      );

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        currentTenantSlug: response.user.tenantSlug || null,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false, isInitialized: true });
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = getClientToken();
      await apiPostClient("/auth/logout", {}, token || undefined);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      get().clearAuth();
    }
  },

  refreshAccessToken: async () => {
    try {
      const token = getClientToken();
      await apiPostClient("/auth/refresh", {}, token || undefined);
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
      currentTenantSlug: null,
      isInitialized: true,
    });
    // Clear tenant slug from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentTenantSlug");
    }
  },

  setCurrentTenant: (tenantSlug: string | null) => {
    set({ currentTenantSlug: tenantSlug });
    // Persist tenant slug to localStorage
    if (typeof window !== "undefined") {
      if (tenantSlug) {
        localStorage.setItem("currentTenantSlug", tenantSlug);
      } else {
        localStorage.removeItem("currentTenantSlug");
      }
    }
  },

  getCurrentTenant: () => {
    return get().currentTenantSlug;
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = getClientToken();

      if (!token) {
        get().clearAuth();
        return;
      }

      const response = await apiGetClient<MeResponse>("/auth/me", token);

      if (response.user) {
        // Extract tenant slug from user.tenant.slug or response.tenant.slug
        const tenantSlug =
          response.user.tenant?.slug || response.tenant?.slug || null;

        set({
          user: response.user,
          isAuthenticated: true,
          currentTenantSlug: tenantSlug,
          isLoading: false,
          isInitialized: true,
        });

        // Sync with localStorage
        if (tenantSlug) {
          localStorage.setItem("currentTenantSlug", tenantSlug);
        }
      } else {
        get().clearAuth();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (
        error instanceof Error &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        // Token is invalid
      }
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
  // Restore tenant slug from localStorage
  const savedTenantSlug = localStorage.getItem("currentTenantSlug");
  if (savedTenantSlug) {
    useAuthStore.getState().setCurrentTenant(savedTenantSlug);
  }

  // Check authentication status on app start
  useAuthStore.getState().checkAuth();
}
