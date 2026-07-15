import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Informe seu e-mail." }, { status: 400 });
  }

  try {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: { email: normalizedEmail },
      anonymous: true,
    });
  } catch {
    // Sempre retorna sucesso, mesmo em erro, para nao revelar quais contas existem.
  }

  return NextResponse.json({ ok: true });
}
