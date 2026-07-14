import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados de login invalidos." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedPassword = String(password ?? "");

  if (!normalizedEmail || !normalizedPassword) {
    return NextResponse.json({ error: "Preencha e-mail e senha." }, { status: 400 });
  }

  try {
    const data = await apiFetch<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email: normalizedEmail, password: normalizedPassword },
      anonymous: true,
    });

    await createSession(data.token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: "E-mail ou senha invalidos." }, { status: 401 });
  }
}
