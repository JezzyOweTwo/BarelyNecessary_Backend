import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { Category } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET(_request: Request) {
  // ensures the user is authenticated before proceeding.
  const validation = await guardRoute(requireAuth,false);
  if (validation) return validation;

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
      data: categories,
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