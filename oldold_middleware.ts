// import { jwtVerify } from "jose";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// function needsCustomerAuth(pathname: string) {
//   return (
//     pathname === "/checkout" ||
//     pathname.startsWith("/checkout/") ||
//     pathname === "/orders" ||
//     pathname.startsWith("/orders/") ||
//     pathname === "/profile" ||
//     pathname.startsWith("/profile/")
//   );
// }

// function needsAdminAuth(pathname: string) {
//   return pathname === "/admin" || pathname.startsWith("/admin/");
// }

// function readToken(request: NextRequest): string | null {
//   const cookie = request.cookies.get("auth")?.value;
//   if (cookie) return cookie;
//   const h = request.headers.get("authorization");
//   if (h?.startsWith("Bearer ")) return h.slice(7).trim() || null;
//   return null;
// }

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   if (!needsCustomerAuth(pathname) && !needsAdminAuth(pathname)) {
//     return NextResponse.next();
//   }

//   const token = readToken(request);
//   if (!token) {
//     const login = new URL("/login", request.url);
//     login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
//     return NextResponse.redirect(login);
//   }

//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   try {
//     const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
//     const role = typeof payload.role === "string" ? payload.role : "";
//     if (role !== "admin" && role !== "customer") {
//       throw new Error("invalid role");
//     }
//     if (needsAdminAuth(pathname) && role !== "admin") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } catch {
//     const login = new URL("/login", request.url);
//     login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
//     return NextResponse.redirect(login);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/checkout",
//     "/checkout/:path*",
//     "/orders",
//     "/orders/:path*",
//     "/profile",
//     "/profile/:path*",
//     "/admin",
//     "/admin/:path*",
//   ],
// };
