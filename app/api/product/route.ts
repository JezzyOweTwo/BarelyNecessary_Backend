import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { Product } from "@/lib/types";

export async function GET() {
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
      products: products,
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