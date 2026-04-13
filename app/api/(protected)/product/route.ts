export const runtime = "nodejs";
import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { Product } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET() {
  // ensures the user is authenticated before proceeding.
  const validation = await guardRoute(requireAuth,false);
  if (validation) return validation;
  
  try {
    const products = await query_db(`
      SELECT
        product_id,
        category_id,
        name,
        brand,
        model,
        short_tagline,
        description,
        price,
        stock_quantity,
        image_url,
        is_featured,
        is_active
      FROM products
      WHERE is_active = 1
      ORDER BY product_id ASC
    `) as Product[];

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error getting products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}