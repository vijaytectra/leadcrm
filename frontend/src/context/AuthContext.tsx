"use client";

import React from "react";
import {
    apiGet,
    apiPost,
    type AuthUser,
    type LoginRequest,
    type LoginResponse,
    type RefreshRequest,
    type RefreshResponse,
    type MeResponse,
    type ApiException
} from "@/lib/utils";

type AuthContextValue = {
    user: AuthUser | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (args: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "crm.accessToken";
const REFRESH_TOKEN_KEY = "crm.refreshToken";
const USER_KEY = "crm.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    // Hydrate from storage
    React.useEffect(() => {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
        const storedRefresh = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
        const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
        if (storedToken && storedRefresh) {
            setAccessToken(storedToken);
            if (storedUser) {
                try {
                    const parsedUser: AuthUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Failed to parse stored user:", error);
                }
            }
            // Attempt to validate token by fetching /auth/me
            apiGet<MeResponse>("/auth/me", { token: storedToken })
                .then((res) => setUser(res.user))
                .catch((error: ApiException) => {
                    console.error("Token validation failed:", error);
                    // try refresh silently
                    refreshAccessToken().catch(() => clearSession());
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const persistSession = React.useCallback((args: { accessToken: string; refreshToken: string; user?: AuthUser }) => {
        setAccessToken(args.accessToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, args.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, args.refreshToken);
        if (args.user) {
            setUser(args.user);
            localStorage.setItem(USER_KEY, JSON.stringify(args.user));
        }
    }, []);

    const clearSession = React.useCallback(() => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }, []);

    const refreshAccessToken = React.useCallback(async (): Promise<void> => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("No refresh token");
        const res = await apiPost<RefreshResponse>("/auth/refresh", { refreshToken } as RefreshRequest);
        persistSession({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }, [persistSession]);

    const login = React.useCallback<AuthContextValue["login"]>(async (loginData: LoginRequest) => {
        setIsLoading(true);
        try {
            const res = await apiPost<LoginResponse>("/auth/login", loginData);
            persistSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [persistSession]);

    const logout = React.useCallback(async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
                await apiPost("/auth/logout", { refreshToken } as RefreshRequest);
            }
        } catch (error) {
            console.error("Logout error:", error);
            // ignore network errors on logout
        } finally {
            clearSession();
        }
    }, [clearSession]);

    // Auto refresh access token periodically (25 min)
    React.useEffect(() => {
        const id = setInterval(() => {
            refreshAccessToken().catch((error: Error) => {
                console.error("Auto refresh failed:", error);
            });
        }, 25 * 60 * 1000);
        return () => clearInterval(id);
    }, [refreshAccessToken]);

    const value: AuthContextValue = {
        user,
        accessToken,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}


