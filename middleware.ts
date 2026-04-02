import { NextRequest } from "next/server";
import { adminMiddleware } from "@/middleware/admin_middleware";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(req);
  }
}