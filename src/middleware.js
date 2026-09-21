import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/session";

const protectedPaths = [
  "/forms",
  "/forms/new",
  "/forms/[id]/edit",
  "/forms/[id]/preview",
  "/forms/[id]/responses",
];

const publicPaths = [
  "/f/",
  "/api/forms/[id]/submissions",
  "/api/forms/slug/",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/f/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/forms/") && pathname.includes("/submissions")) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((path) => 
    pathname === path || pathname.startsWith(path.replace("[]", ""))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPaths.some((path) => {
    const regexPath = path.replace(/\[.*?\]/g, "[^/]+");
    return new RegExp(`^${regexPath}`).test(pathname);
  });

  if (isProtectedPath) {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login" || pathname === "/signup") {
    const user = await getUserFromRequest(request);
    if (user) {
      return NextResponse.redirect(new URL("/forms", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/forms/:path*",
    "/login",
    "/signup",
    "/f/:path*",
  ],
};