import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
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
    `);

    return NextResponse.json({
      success: true,
      products: rows,
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