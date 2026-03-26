import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { Category } from "@/lib/types";

export async function GET(_request: Request) {
  try {

    const categories = await query_db(
      `
        SELECT
          category_id,
          category_name,
          description
        FROM categories
        ORDER BY category_id ASC;
      `
    ) as Category[];

    if (categories.length === 0) {
      return NextResponse.json(
        { success: false, message: "Apparently, we don't have a single product category." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.error("Error parsing product category array:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get product categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(){

}