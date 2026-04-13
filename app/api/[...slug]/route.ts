
import { NextResponse } from "next/server";

export async function GET() {
  // sets message and status code to 404, and rreturns the response
  return NextResponse.json(
    { message: "This route does not exist." },
    { status: 404 }
  );
}

// export async function GET() {
//   return new Response("brothaaaaaa that route don't EXISTTTTTTTTTTTTT");
// }