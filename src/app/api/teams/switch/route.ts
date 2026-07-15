import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { ACTIVE_TEAM_COOKIE } from "@/lib/team";
import { isSecureCookieContext } from "@/lib/cookie-options";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { teamId } = (body ?? {}) as { teamId?: unknown };
  const normalizedTeamId = String(teamId ?? "");

  if (!normalizedTeamId) {
    return NextResponse.json({ error: "Time invalido." }, { status: 400 });
  }

  try {
    // Verifica se o time existe e pertence ao scrum master.
    await apiFetch(`/teams/${normalizedTeamId}`, { method: "GET" });
  } catch {
    // time nao encontrado ou nao pertence ao scrum master; ignora
    return NextResponse.json({ ok: true });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACTIVE_TEAM_COOKIE, normalizedTeamId, {
    httpOnly: true,
    secure: isSecureCookieContext(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
