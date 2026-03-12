import { NextResponse } from "next/server";
import { getAll } from "@/lib/database_handler";
import { Item } from "@/models/Item";

export async function GET() {
  try {
    const products = await getAll<Item>("products");
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch products." },
      { status: 500 }
    );
  }
}