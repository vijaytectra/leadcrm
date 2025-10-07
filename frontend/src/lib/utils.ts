import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// API Error types
export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

export class ApiException extends Error {
  public status: number;
  public error: ApiError;

  constructor(message: string, status: number, error: ApiError) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.error = error;
  }
}

// API Request/Response types
export interface ApiRequestOptions {
  token?: string;
}

export interface LoginRequest {
  tenant: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  tenantId: string;
  tenantSlug?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  user: AuthUser;
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "POST",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(
      (): ApiError => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      })
    );
    throw new ApiException("API Error", res.status, errorData);
  }

  return res.json();
}

export async function apiGet<TResponse>(
  path: string,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include", // Include cookies in requests
    headers: {
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(
      (): ApiError => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      })
    );
    throw new ApiException("API Error", res.status, errorData);
  }

  return res.json();
}
