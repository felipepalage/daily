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

  const { token, password } = (body ?? {}) as { token?: unknown; password?: unknown };
  const normalizedToken = String(token ?? "");
  const normalizedPassword = String(password ?? "");

  if (!normalizedToken) {
    return NextResponse.json({ error: "Link invalido ou expirado." }, { status: 400 });
  }

  if (normalizedPassword.length < 6) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  try {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: { token: normalizedToken, password: normalizedPassword },
      anonymous: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Link invalido ou expirado. Peca um novo." }, { status: 400 });
  }
}
