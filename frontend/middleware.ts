import { type NextRequest, NextResponse } from "next/server";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  organiser: "/dashboard/services",
  customer: "/services", // Or wherever customers land
};

const AUTH_PAGES = ["/login", "/signup", "/register", "/join-organization"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Read cookies that will be set during our new authentication flow
  const accessToken = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value || "customer";

  // Auth pages: redirect authenticated users to their dashboard
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    // If they have a token, and aren't trying to join an org (maybe they just registered)
    if (accessToken && !pathname.startsWith("/join-organization")) {
      const dest = ROLE_DASHBOARDS[role] || "/services";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Allow public landing page and share links
  if (pathname === "/" || pathname.startsWith("/landing") || pathname.startsWith("/share") || pathname.startsWith("/book")) {
    return NextResponse.next();
  }

  // Protected routes: require auth
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
  }

  // Organiser routes protection (e.g. /dashboard)
  if (pathname.startsWith("/dashboard") && role !== "organiser" && role !== "admin") {
    return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
