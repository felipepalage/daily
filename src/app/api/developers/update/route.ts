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

  const { id, name, role, email, redmineUserId } = (body ?? {}) as Record<string, unknown>;
  const normalizedId = String(id ?? "");
  const normalizedName = String(name ?? "").trim();
  const normalizedRole = String(role ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedRedmineUserId = String(redmineUserId ?? "").trim();

  if (!normalizedId) {
    return NextResponse.json({ error: "Desenvolvedor invalido." }, { status: 400 });
  }
  if (!normalizedName) {
    return NextResponse.json({ error: "Informe o nome do desenvolvedor." }, { status: 400 });
  }

  try {
    await apiFetch(`/developers/${normalizedId}`, {
      method: "PUT",
      body: {
        name: normalizedName,
        role: normalizedRole || null,
        email: normalizedEmail || null,
        redmineUserId: normalizedRedmineUserId || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao atualizar desenvolvedor." }, { status: 500 });
  }
}
