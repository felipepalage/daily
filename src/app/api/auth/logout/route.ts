import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/api";

export const runtime = "edge";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}

// Variante GET usada pelas páginas de servidor quando o cookie existe mas a
// sessão é inválida no backend. Limpa o cookie e leva ao /login — sem isso o
// middleware (que só decodifica o JWT localmente) devolveria para o /dashboard
// e criaria um loop de redirecionamento.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
