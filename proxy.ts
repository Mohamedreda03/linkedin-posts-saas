import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// API routes and static files that should be excluded from proxy
const excludedPaths = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/images",
  "/fonts",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for excluded paths
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Note: We cannot reliably check Appwrite session cookies in proxy
  // because Appwrite uses httpOnly cookies that may not be accessible here.
  // Authentication redirects are handled client-side in auth-context.tsx
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
