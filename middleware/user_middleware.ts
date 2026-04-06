import { NextRequest } from "next/server";
import {guardRoute} from "@/lib/guard_route"
import {requireAuth} from "@/lib/validators"

// this middleware automatically will run on all /api routes.
// User needs to provide a JWT key ( AKA needs to be logged in)
// If not provided or incorrect, one of two things will happen:
// if this is a front end page, the user will be redirected to the error page.
// if this was an api call, the use will be served a 403 auth error.

export async function userMiddleware(req: NextRequest,isApiCall:boolean) {
  return guardRoute(req, isApiCall,requireAuth);
}
