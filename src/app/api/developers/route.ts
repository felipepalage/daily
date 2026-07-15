import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { name, role, email, teamId } = (body ?? {}) as Record<string, unknown>;
  const normalizedName = String(name ?? "").trim();
  const normalizedRole = String(role ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedTeamId = String(teamId ?? "");

  if (!normalizedName) {
    return NextResponse.json({ error: "Informe o nome do desenvolvedor." }, { status: 400 });
  }

  try {
    await apiFetch("/developers", {
      method: "POST",
      body: {
        name: normalizedName,
        role: normalizedRole || null,
        email: normalizedEmail || null,
        teamId: normalizedTeamId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao criar desenvolvedor." }, { status: 500 });
  }
}
