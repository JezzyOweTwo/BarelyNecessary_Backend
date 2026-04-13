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
        const decoded = jwt.verify(token, secret) as any;

        if (!decoded.userID) 
            throw new Error("401|Authorization error: User Identification Token Missing");
    
        if (! await isValidUUID(decoded.userID))
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
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isValid =  uuidV4Regex.test(uuid);
        if (!isValid) throw new Error("400|Validation error: Invalid UUID format");
    }
    catch (err:any){
        return generateError(err);
    }
    return null;
}

function extractBearerToken(authHeader: string | null | undefined): string | null  {
    if (!authHeader) return null;
    if (!(authHeader?.startsWith(BEARER_PREFIX))) return null;
    return authHeader.slice(BEARER_PREFIX.length);
}

function generateError(err:any): ValidationError {
    const errMsgAndCode = err?.message || "500|Unknown error!";
    const errorArr = errMsgAndCode.split("|");
    const errorcode:number =  parseInt(errorArr[0]);
    const errormessage:string =  errorArr[1];
    const validationErr:ValidationError = {message : errormessage, code : errorcode};
    return validationErr;
}
