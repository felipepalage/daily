import { cookies } from "next/headers";

export const TOKEN_COOKIE = "daily_token";

export function apiBaseUrl() {
  const configuredUrl = process.env.DAILY_API_URL ?? process.env.VITE_API_BASE_URL ?? "https://daily-backend.zitec.ai";
  const root = configuredUrl.replace(/\/+$/, "");
  return root.endsWith("/api") ? root : `${root}/api`;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  anonymous?: boolean;
  cache?: RequestCache;
};

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, anonymous = false, cache = "no-store" } = options;

  let token = options.token ?? null;
  if (!anonymous && !token) {
    const cookieStore = await cookies();
    token = cookieStore.get(TOKEN_COOKIE)?.value ?? null;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
      else if (data?.title) message = data.title;
    } catch {
      // Keep the status-based fallback for non-JSON responses.
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
