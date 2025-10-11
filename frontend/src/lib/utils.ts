import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getToken } from "./getToken";
import { getClientToken } from "./client-token";

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
  tenant?: {
    id: string;
    name: string;
    slug: string;
    subscriptionStatus: string;
    subscriptionTier: string;
  };
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
  tenant?: Tenant;
}
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  if (opts?.token) {
    token = await getToken();

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "POST",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function apiPut<TResponse>(
  path: string,
  body: unknown,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  if (opts?.token) {
    token = await getToken();

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "PUT",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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
  let token: string | undefined = undefined;
  if (opts?.token) {
    token = await getToken();
    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include", // Include cookies in requests
    headers: {
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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

// Client-side API functions that don't use server actions
export async function apiGetClient<TResponse>(
  path: string,
  token?: string
): Promise<TResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include",
    headers,
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

export async function apiPostClient<TResponse>(
  path: string,
  body: unknown,
  token?: string
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// Client-side API functions for browser usage
export async function apiGetClientNew<TResponse>(
  path: string,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  console.log("token", opts?.token);
  if (opts?.token) {
    const clientToken = getClientToken();
    token = clientToken || undefined;

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include", // Include cookies in requests
    headers: {
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function apiPostClientNew<TResponse>(
  path: string,
  body: unknown,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  if (opts?.token) {
    const clientToken = getClientToken();
    token = clientToken || undefined;

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "POST",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function apiPutClient<TResponse>(
  path: string,
  body: unknown,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  if (opts?.token) {
    const clientToken = getClientToken();
    token = clientToken || undefined;

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "PUT",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function apiDeleteClient<TResponse>(
  path: string,
  opts?: ApiRequestOptions
): Promise<TResponse> {
  let token: string | undefined = undefined;
  if (opts?.token) {
    const clientToken = getClientToken();
    token = clientToken || undefined;

    if (!token || token === "") {
      throw new ApiException("Unauthorized", 401, {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "DELETE",
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
