"use client";

/**
 * Client-side fetch wrapper.
 *
 * - Same-origin requests, so httpOnly auth cookies ride along automatically.
 * - On a 401 from a protected endpoint it performs a SINGLE-FLIGHT refresh
 *   (POST /api/auth/refresh) and retries the original request once.
 * - If refresh fails it dispatches a global `auth:logout` event that
 *   AuthContext listens for to clear state and route to login.
 *
 * Mirrors the original axios interceptor in services/api.ts.
 */

export type ApiError = {
  success: false;
  error: string;
  code: string;
  statusCode: number;
  requestId?: string;
  details?: { field: string; message: string }[];
};

export class ApiClientError extends Error {
  code: string;
  statusCode: number;
  details?: { field: string; message: string }[];
  constructor(payload: ApiError) {
    super(payload.error || "Request failed");
    this.name = "ApiClientError";
    this.code = payload.code;
    this.statusCode = payload.statusCode;
    this.details = payload.details;
  }
}

const PUBLIC_AUTH_PATHS = [
  "/auth/refresh",
  "/auth/patient/login",
  "/auth/psychiatrist/login",
  "/auth/admin/login",
  "/auth/patient/register",
  "/auth/psychiatrist/register",
];

const isPublicAuthPath = (path: string) => PUBLIC_AUTH_PATHS.some((p) => path.includes(p));

let refreshInFlight: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

type RequestOptions = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit | null };

async function request<T = unknown>(path: string, options: RequestOptions = {}, _retried = false): Promise<T> {
  const url = path.startsWith("/api") ? path : `/api${path}`;

  const headers = new Headers(options.headers);
  let body = options.body ?? null;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, body, credentials: "include" });
  } catch {
    throw new ApiClientError({
      success: false,
      error: typeof navigator !== "undefined" && !navigator.onLine
        ? "You are offline. Please check your connection."
        : "Network error: unable to reach the server.",
      code: "NETWORK_ERROR",
      statusCode: 0,
    });
  }

  if (res.status === 401 && !_retried && !isPublicAuthPath(url)) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, true);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiClientError(
      (payload as ApiError) ?? { success: false, error: "Request failed", code: "UNKNOWN", statusCode: res.status }
    );
  }
  return payload as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: "GET" }),
  post: <T = unknown>(path: string, json?: unknown) => request<T>(path, { method: "POST", json }),
  put: <T = unknown>(path: string, json?: unknown) => request<T>(path, { method: "PUT", json }),
  patch: <T = unknown>(path: string, json?: unknown) => request<T>(path, { method: "PATCH", json }),
  del: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T = unknown>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};
