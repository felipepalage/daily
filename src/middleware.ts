import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

const TOKEN_COOKIE = "daily_token";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

type Role = "scrumMaster" | "developer";

// O token é emitido e validado de fato pela API .NET. Aqui no middleware só
// decodificamos (sem verificar assinatura) para checar presença/expiração e ler
// o `role`, decidindo o redirecionamento. A autorização real acontece na API.
function readSession(request: NextRequest): { authenticated: boolean; role: Role } {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return { authenticated: false, role: "scrumMaster" };

  try {
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { authenticated: false, role: "scrumMaster" };
    }
    const role: Role = payload.role === "developer" ? "developer" : "scrumMaster";
    return { authenticated: true, role };
  } catch {
    return { authenticated: false, role: "scrumMaster" };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Link público de check-in do dev: acessível sem login.
  if (pathname.startsWith("/checkin/")) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const { authenticated, role } = readSession(request);

  const home = role === "developer" ? "/meu-checkin" : "/dashboard";

  if (!isPublicPath && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && authenticated) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (authenticated) {
    // Developer não acessa o painel do gestor; gestor não acessa a tela do dev.
    if (role === "developer" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/meu-checkin", request.url));
    }
    if (role === "scrumMaster" && pathname.startsWith("/meu-checkin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon.png|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
