// deprecated

// import { NextRequest } from "next/server";
// import {guardRoute} from "@/lib/guard_route"
// import {requireAdminAuth} from "@/lib/validators"

// // this middleware will run on all /admin routes, and require the user to 
// // provide an admin authentication key in the header. 
// // If not provided or incorrect, one of two thins will happen:
// // if this is a front end page, the user will be redirected to the error page.
// // if this was an api call, the use will be served a 403 auth error.

// export async function adminMiddleware(req: NextRequest,isApiCall:boolean) {
//   return guardRoute(req, isApiCall,requireAdminAuth);
// }
