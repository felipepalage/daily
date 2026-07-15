import { cookies } from "next/headers";
import { apiFetch, TOKEN_COOKIE } from "@/lib/api";
import { isSecureCookieContext } from "@/lib/cookie-options";

export type SessionRole = "scrumMaster" | "developer";

export type SessionPayload = {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
  teamId?: string;
  // Compat: alguns trechos antigos usam scrumMasterId.
  scrumMasterId: string;
};

// --- hash/verify delegam para a API (bcrypt fica no backend) ---
// Mantidas aqui apenas para compatibilidade com imports existentes que usam
// hashPassword / verifyPassword diretamente (ex: actions de settings).
// A lógica de autenticação real (login) vai para a API.
import bcrypt from "bcryptjs";
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// --- Sessão usando o token JWT da API ---
// O token JWT é armazenado num cookie httpOnly.
// createSession agora recebe o token JWT (string), não um payload,
// pois quem gera o token é o backend.

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isSecureCookieContext(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  // Verifica o token contra a API (endpoint /auth/me), que devolve os dados
  // do usuário (scrum master ou developer) se o token for válido.
  try {
    const me = await apiFetch<Partial<SessionPayload> & { scrumMasterId?: string }>("/auth/me", {
      token,
      cache: "no-store",
    });

    // Normaliza resposta antiga (só scrumMasterId) e nova (id + role + teamId).
    const id = me.id ?? me.scrumMasterId ?? "";
    const role: SessionRole = me.role ?? "scrumMaster";

    return {
      id,
      scrumMasterId: me.scrumMasterId ?? id,
      name: me.name ?? "",
      email: me.email ?? "",
      role,
      teamId: me.teamId,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Sessão inválida ou expirada.");
  }
  return session;
}

export { TOKEN_COOKIE as SESSION_COOKIE };