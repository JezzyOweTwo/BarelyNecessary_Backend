import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";
import { runWithProxyRequest } from "@/lib/proxy_request_context";

/**
 * Next.js 16+ network boundary (replaces deprecated middleware.ts).
 * Protects:
 * - /admin/*: must be logged in as admin
 * - /checkout/*: must be logged in
 */
export async function proxy(request: NextRequest) {
  return runWithProxyRequest(request, async () => {
    const pathname = request.nextUrl.pathname;
    const requireAdmin = pathname.startsWith("/admin");
    const validation = await guardRoute(requireAuth, requireAdmin);
    if (validation) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  });
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/checkout/:path*"],
};
