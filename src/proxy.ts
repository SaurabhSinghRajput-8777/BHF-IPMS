import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "bhf_ipms_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Public paths that do not require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname === "/apply" ||
    pathname === "/login" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/api/v1/auth/login") ||
    pathname.startsWith("/api/v1/public/") ||
    pathname.startsWith("/api/v1/questionnaires/active") ||
    pathname.startsWith("/api/v1/health") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  // If trying to access a protected route without a session cookie, redirect to /login
  if (!sessionCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If visiting /login while already carrying a session cookie, let the page redirect or proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

