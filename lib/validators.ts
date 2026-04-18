import jwt from "jsonwebtoken"
import { cookies, headers } from "next/headers";
import { ValidationError } from "./types";
const BEARER_PREFIX = "Bearer ";

// this validation function will ensure that the user is logged in.
// @params 
// requireAdmin: if set to true the user must be an administrator.
//               if false, any logged in user is sufficient
export async function requireAuth(requireAdmin:boolean) :Promise<ValidationError | null>{
    try{
        const cookieStore = await cookies();                    // cookie store
        const headerStore = await headers();                    // header store

        const headerToken = extractBearerToken(headerStore.get("authorization"));     // retrieves authentication header token
        const cookieToken = cookieStore.get("auth")?.value ?? null;                   // retrieves auth token from cookie
        const token = cookieToken ?? headerToken;                                     // whichever is non null, use it

        // validates token presence
        if (!token)     
            throw new Error("401|Authorization token missing!");         
        
        // ensures JWT secret is present
        const secret = process.env.JWT_SECRET;
        if (!secret) 
            throw new Error("500|Server configuration error: missing JWT secret");

        // decodes JWT, verifies user id token
        let decoded;
        try{decoded = jwt.verify(token, secret) as any;}
        catch (err) {throw new Error("401|Authorization error: Invalid or expired token");}

        //console.log(decoded);
        if (!decoded.userId) 
            throw new Error("401|Authorization error: User Identification Token Missing");
    
        if ( await isValidUUID(decoded.userId))
            throw new Error("401|Authorization error: User Identification Token Malformed");
        
        // ensures user is an admin
        if (requireAdmin) {
            if (decoded.role !== "admin") 
                {throw new Error("403|Authorization error: Invalid admin credentials");}
        } 
        
        // ensures user is logged in at all
        else {
            if (decoded.role !== "admin" && decoded.role !== "customer") 
                {throw new Error("403|Authorization error: Invalid login credentials");}
        }

    }
    catch (err:any){
        return generateError(err);
    }

    return null;
}

export async function isValidUUID(uuid: string):Promise<ValidationError | null> {
    try{
        uuid = uuid.trim();
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isValid =  uuidV4Regex.test(uuid);
        if (!isValid) throw new Error("400|Validation error: Invalid UUID format");
    }
    catch (err:any){return generateError(err);}
    return null;
}

function extractBearerToken(authHeader: string | null | undefined): string | null  {
    if (!authHeader) return null;
    if (!(authHeader?.startsWith(BEARER_PREFIX))) return null;
    return authHeader.slice(BEARER_PREFIX.length);
}

/** Read the verified JWT claims for the current request (cookie or Authorization header). */
export async function getAuthClaims(): Promise<{ userId: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const headerToken = extractBearerToken(headerStore.get("authorization"));
    const cookieToken = cookieStore.get("auth")?.value ?? null;
    const token = cookieToken ?? headerToken;
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as { userId?: string; role?: string };
    if (!decoded.userId || !decoded.role) return null;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

function generateError(err:any): ValidationError {
    // console.log(err);

    let errorCode:number = 500;
    let errorMessage = "An unknown error occurred.";

    const errMsgAndCode = (err instanceof Error && typeof err.message === "string") ?  err.message : "500|Unknown error!";
    const errorArr = errMsgAndCode.split("|");
    
    // if it was an error from our code, it will be in the format "code|message". If not, we just return a generic 500 error.
    if (errorArr.length===2){
        errorCode = parseInt(errorArr[0]); 
        errorMessage = errorArr[1];
    }
    
    // deals with errors thrown in our code that don't follow the "code|message" format, but still have a message property. 
    else {
        if ((err.message!==null&& (err.message!==undefined) && (err.message !== "") && (typeof err.message === "string")) )
            errorMessage = err.message;
    }
    const validationErr:ValidationError = {message : errorMessage, code : errorCode};

    // console.log("Validation error: ", validationErr);
    return validationErr;
}
//
