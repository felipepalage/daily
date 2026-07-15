import { NextResponse } from "next/server";
import { apiFetch, ApiError, TOKEN_COOKIE } from "@/lib/api";
import { isSecureCookieContext } from "@/lib/cookie-options";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados de cadastro invalidos." }, { status: 400 });
  }

  const { name, email, password, confirmPassword } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
  };

  const normalizedName = String(name ?? "").trim();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedPassword = String(password ?? "");
  const normalizedConfirm = String(confirmPassword ?? "");

  if (!normalizedName || !normalizedEmail || !normalizedPassword || !normalizedConfirm) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  if (normalizedPassword.length < 6) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  if (normalizedPassword !== normalizedConfirm) {
    return NextResponse.json({ error: "As senhas nao conferem." }, { status: 400 });
  }

  try {
    const data = await apiFetch<{ token: string }>("/auth/register", {
      method: "POST",
      body: {
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        confirmPassword: normalizedConfirm,
      },
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

    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
