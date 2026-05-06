import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";

const SESSION_COOKIE = "dm_session";

// Public paths that don't require auth
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

const PUBLIC_API = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
];

const isPublic = (pathname: string): boolean => {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (PUBLIC_API.includes(pathname)) return true;
  return false;
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const isApi = pathname.startsWith("/api/");

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    if (isApi) {
      const res = NextResponse.json({ error: "Session expired" }, { status: 401 });
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Forward user id via header for downstream handlers (optional convenience)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.sub);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Run proxy on all routes except:
     *  - _next/static, _next/image, favicon (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json).*)",
  ],
};
