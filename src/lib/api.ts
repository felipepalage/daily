import { cookies } from "next/headers";

export const TOKEN_COOKIE = "daily_token";

// URL base do backend .NET. Configurável por env; padrão é o dev local.
export function apiBaseUrl() {
  return process.env.DAILY_API_URL ?? "http://localhost:5080";
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
  // Se true, não envia o cookie de token (para chamadas públicas).
  anonymous?: boolean;
  cache?: RequestCache;
};

// Chama a API .NET. Anexa o token JWT (do cookie) como Bearer, exceto quando
// anonymous=true. Lança ApiError em respostas não-ok, com a mensagem do backend.
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
      // corpo não-JSON; mantém a mensagem padrão
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
