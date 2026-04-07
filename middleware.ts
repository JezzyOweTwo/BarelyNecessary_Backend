import { NextRequest } from "next/server";
import { adminMiddleware } from "@/middleware/admin_middleware";
import { userMiddleware } from "./middleware/user_middleware";
import {NextResponse} from "next/server";
export const runtime = "nodejs";

export async function middleware(req: NextRequest) {

  // if validation fails, a redirect object will be returned.
  // if sucessful, null is returned, and we go to the next page.
  if (req.nextUrl.pathname.startsWith("/admin")) {
	const guard = await adminMiddleware(req,false); 
	if (guard) return guard;
	return NextResponse.next();
  }

  // if validation fails, a redirect object will be returned.
  // if sucessful, null is returned, and we go to the next page.
  else if (req.nextUrl.pathname.startsWith("/api/admin")) {
	const guard = await adminMiddleware(req,true);
	if (guard) return guard;
	return NextResponse.next();
  }

  // all of these API routes requires the user to be logged in to use.
  // if validation fails, an erro JSON is returned to the user.
  // if validation suceeds, they will continue to the next page.
  else if (req.nextUrl.pathname.startsWith("/api/protected")) {
	const guard = await userMiddleware(req,true);
	if (guard) return guard;
	return NextResponse.next();
  }
}