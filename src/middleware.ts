import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "kargo_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kargo-rentals-fallback-secret"
);

const PUBLIC_PATHS = ["/login", "/setup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/setup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/vehicles") ||
    pathname.startsWith("/uploads") ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
