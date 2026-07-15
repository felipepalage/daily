import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { ACTIVE_TEAM_COOKIE } from "@/lib/team";

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
    await apiFetch(`/teams/${normalizedTeamId}`, { method: "DELETE" });
  } catch {
    // se falhou (ex: nao encontrado), ignora
  }

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get(ACTIVE_TEAM_COOKIE)?.value;

  const response = NextResponse.json({ ok: true });
  if (activeTeamId === normalizedTeamId) {
    response.cookies.delete(ACTIVE_TEAM_COOKIE);
  }
  return response;
}
