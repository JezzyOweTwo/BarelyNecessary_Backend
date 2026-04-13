import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { RouteContext } from "@/lib/types";
import { Category } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET(_request: Request, context: RouteContext<{id:string}>) {
  try {
    // ensures the user is authenticated before proceeding.
    const validation = await guardRoute(requireAuth,false);
    if (validation) return validation;
    
    const { id } = await context.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Category ID" },
        { status: 400 }
      );
    }

    const category = await query_db(
      `
        SELECT
        category_id,
        category_name,
        description
        FROM categories
        WHERE category_id = ?
        LIMIT 1;
      `,[id]
    ) as Category[];


    if (category.length === 0) {
      return NextResponse.json(
        { success: false, message: `Error! could not locate category with id: ${id}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category[0],
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

export function parseId(id: string | undefined): number | null {
  if (!id) return null;
  const parsed = Number(id);
  return Number.isNaN(parsed) ? null : parsed;
}