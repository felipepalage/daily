import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";
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

  const { name } = (body ?? {}) as { name?: unknown };
  const normalizedName = String(name ?? "").trim();

  if (!normalizedName) {
    return NextResponse.json({ error: "Informe o nome do time." }, { status: 400 });
  }

  try {
    const team = await apiFetch<{ id: string }>("/teams", {
      method: "POST",
      body: { name: normalizedName },
    });

    const response = NextResponse.json({ ok: true, id: team.id });
    response.cookies.set(ACTIVE_TEAM_COOKIE, team.id, {
      httpOnly: true,
      secure: isSecureCookieContext(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao criar time." }, { status: 500 });
  }
}
