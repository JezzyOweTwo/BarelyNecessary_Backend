import {NextResponse} from "next/server";
import {ValidationError, Validator} from "@/lib/types";
import { get_server_auth_token } from "./server_init";

// takes in a validation function as an arguement, and runs it. 
// if the request was unsuccessful, return a JSON error object & status code.
// if the request was successful, return null, and allow passage.
export async function guardRoute<ExtraArgs extends unknown[] = []>(
  validator: Validator<ExtraArgs>,
  ...extraArgs: ExtraArgs
): Promise<NextResponse | null> {
  get_server_auth_token();  // literally just here to initalize the auth token so I can use it
    try{
      const response:ValidationError | null = await validator(...extraArgs);

      // if validation failed, we return an error JSON + status code.
      if (response) {
        return NextResponse.json(
          // Keep legacy `data` while standardizing on { success, message } everywhere.
          { success: false, message: response.message, data: response.message },
          { status: response.code }
        );
      }

    }

    // if the validator throws an uncaught error, we catch it here and return a generic 500 error response.
    catch {
      return NextResponse.json(
        {
          success: false,
          message: "An unknown validation error occurred.",
          data: "An unknown validation error occurred.",
        },
        { status: 500 }
      );
    }

    // otherwise, we chill. We allow passage to the next route
    return null;   
}


