import {NextResponse} from "next/server";

// im not even gonna pretend like i understand the specifics, but its 
// providing variable arguement support for our validation functions
type Validator<ExtraArgs extends any[] = []> = (req: Request, ...args: ExtraArgs) => Promise<NextResponse>;

// takes in a validation function as an arguement, and tries to apply the validator. 
// if the validation is unsucessful, the user will either:
//   be redirected to the error page if this was a front end request
//   be served a JSON object if this was an API call
// if the validation is sucessful, the user will forwarded to the intended page.

export async function guardRoute<ExtraArgs extends any[] = []>( req: Request, isApiCall: boolean, validator: Validator<ExtraArgs>,...extraArgs: ExtraArgs): Promise<NextResponse | null> {
  try {
    const response:NextResponse = await validator(req, ...extraArgs);

    // if the response returned a bad error code, we'll redirect them away from da page.
    if (!response.ok) {
      const body = await response.json();
      return redirectUser(body?.data, response.status, req.url, isApiCall);
    }
    
    // otherwise, we chill. We allow passage to the next route
    return null;   
  } 

  // strange error prevention
  catch (err: any) {
    return redirectUser(err?.message, 500, req.url, isApiCall);
  }
}

function redirectUser(rawMessage:string | undefined, code:number, url:string, isApiCall:boolean){
  const message = encodeURIComponent(rawMessage || "Unknown Error!");

  // if its an API call, it doesn't make sense to 
  // redirect to a front end page. we'll instead return back a json object.
  if (isApiCall){
    return NextResponse.json(
      { data: message },
      { status: code }
    );
  }

  // if the request is to a front end page, we will send them
  // to the generic error page, and pass some context about the error.
  const origin = new URL(url).origin;
  const newurl = new URL(`/error?code=${code}&message=${message}`, origin);
  return NextResponse.redirect(newurl)
}