import { NextRequest } from "next/server";
import {guardRoute} from "@/lib/guardRoute"
import {requireAdminAuth} from "@/lib/auth"

// this middleware will run on all /admin routes, and require the user to 
// provide an admin authentication key in the header. If not provided or 
// incorrect, the user will be redirected to the generic error page.
export async function adminMiddleware(req: NextRequest) {
  return guardRoute(req, requireAdminAuth);
}

// Apply only to /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};