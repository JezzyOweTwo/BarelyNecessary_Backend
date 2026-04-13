// not done with this page yet

// // if the request is to a front end page, we will send them
// // to the generic error page, and pass some context about the error.

// import { url } from "inspector/promises";
// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
// import {NextResponse} from "next/server";
// import { requireAdminAuth } from "@/lib/validators";


// export default async function ProtectedLayout({ children }) {
//     try {
//         //
//         const response:NextResponse = await requireAdminAuth(req);

//         // if the response returned a bad error code, we'll redirect them away from da page.
//         if (!response.ok) {
//             const body = await response.json();
//             const message = encodeURIComponent(body?.data || "Unknown Error!");
//             const newurl = `/error?code=${response.status}&message=${message}`;
//             redirect(newurl);
//         }
        
//         // otherwise, we chill. We allow passage to the next route
//          return <>{children}</>;    
//     }

//     // strange error prevention
//     catch (err: any) {
//         const message = encodeURIComponent(err?.message || "Unknown Error!");
//         const newurl = `/error?code=${500}&message=${message}`;
//         redirect(newurl);
//     }
// }
