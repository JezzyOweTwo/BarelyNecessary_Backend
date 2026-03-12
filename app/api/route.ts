
import { NextResponse } from "next/server";
import { getAll } from "@/lib/database_handler";

export async function GET() {
  try {
    const users = await getAll("users");
    const products = await getAll("products");

    return NextResponse.json({ users, products });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch data.", error: String(error) },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   return new Response("brothaaaaaa that route don't EXISTTTTTTTTTTTTT");
// }