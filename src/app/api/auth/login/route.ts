import { NextResponse } from "next/server";
import { apiFetch, ApiError, TOKEN_COOKIE } from "@/lib/api";
import { isSecureCookieContext } from "@/lib/cookie-options";

export const runtime = "edge";

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

    const response = NextResponse.json({ ok: true });
    response.cookies.set(TOKEN_COOKIE, data.token, {
      httpOnly: true,
      secure: isSecureCookieContext(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: "E-mail ou senha invalidos." }, { status: 401 });
  }
}
