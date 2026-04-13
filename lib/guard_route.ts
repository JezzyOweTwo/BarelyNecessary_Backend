import {NextResponse} from "next/server";
import {ValidationError, Validator} from "@/lib/types";

// takes in a validation function as an arguement, and runs it. 
// if the request was unsuccessful, return a JSON error object & status code.
// if the request was successful, return null, and allow passage.
export async function guardRoute<ExtraArgs extends any[] = []>(validator: Validator<ExtraArgs>,...extraArgs: ExtraArgs): Promise<NextResponse | null> {

    const response:ValidationError | null = await validator(...extraArgs);

    // if validation failed, we return an error JSON + status code.
    if (response) {
      return NextResponse.json(
        { data: response.message },
        { status: response.code }
      );
    }
    
    // otherwise, we chill. We allow passage to the next route
    return null;   
}


