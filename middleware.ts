import { NextRequest } from "next/server";
import { adminMiddleware } from "@/middleware/admin_middleware";
import { userMiddleware } from "./middleware/user_middleware";
import {NextResponse} from "next/server";

export async function middleware(req: NextRequest) {

  // if validation fails, a redirect object will be returned.
  // if sucessful, null is returned, and we go to the next page.
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const guard = await adminMiddleware(req,false); 
    if (guard) return guard;
    return NextResponse.next();
  }

  //most API routes require being logged in, (except for these two, obviously)
  else if (req.nextUrl.pathname.startsWith("/api/signup")){}
  else if (req.nextUrl.pathname.startsWith("/api/login")){}

  // if validation fails, a redirect object will be returned.
  // if sucessful, null is returned, and we go to the next page.
  else if (req.nextUrl.pathname.startsWith("/api/admin")) {
    const guard = await adminMiddleware(req,true);
    if (guard) return guard;
    return NextResponse.next();
  }

  // if validation fails, a redirect object will be returned.
  // if sucessful, null is returned, and we go to the next page.
  else if (req.nextUrl.pathname.startsWith("/api")) {
    const guard = await userMiddleware(req,true);
    if (guard) return guard;
    return NextResponse.next();
  }
  
}