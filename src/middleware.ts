import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

const TOKEN_COOKIE = "daily_token";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

// O token é emitido e validado de fato pela API .NET. Aqui no middleware só
// checamos presença e expiração (decode sem verificar assinatura) para decidir
// o redirecionamento — a autorização real acontece na API a cada chamada.
function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return false;

  try {
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Link público de check-in do dev: acessível sem login, e não redireciona
  // embora o navegador tenha uma sessão de scrum master ativa.
  if (pathname.startsWith("/checkin/")) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthenticated = hasValidSession(request);

  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon.png|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
