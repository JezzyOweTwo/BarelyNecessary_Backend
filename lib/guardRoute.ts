import {NextResponse} from "next/server";
// takes in a validation function as an arguement, and tries to apply the validator. 
// if the validation is unsucessful, the user will be redirected to the generic error page.
// if the validation is sucessful, the user will forwarded to the intended page.
export async function guardRoute(req: Request, validator: (req: Request) => Promise<NextResponse>):Promise<NextResponse> {
  try {
    const response = await validator(req);

    // ensures that the validator function doesn't return a bad error code.
    if (!response.ok) {
        const data = await response.json(); // extract the message
        const message = encodeURIComponent(data?.data || "Unknown Error!");
        const url:URL = new URL(`/error?code=${response.status}&message=${message}`, req.url);
        return NextResponse.redirect(url)
    }

    return NextResponse.next();   // continue to the page or API route
  } 

  // strange error prevention
  catch (err: any) {
    const message = encodeURIComponent(err?.message || "Unknown Error!");
    const url:URL = new URL(`/error?code=500&message=${message}`, req.url);
    return NextResponse.redirect(url);
  }
}