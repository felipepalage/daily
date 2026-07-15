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

  const b = (body ?? {}) as Record<string, unknown>;
  const currentPassword = String(b.currentPassword ?? "");
  const newPassword = String(b.newPassword ?? "");
  const confirmPassword = String(b.confirmPassword ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "As senhas nao conferem." }, { status: 400 });
  }

  try {
    await apiFetch("/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao alterar senha." }, { status: 500 });
  }
}
