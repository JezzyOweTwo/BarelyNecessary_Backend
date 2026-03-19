import { NextResponse } from "next/server";
import pool from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
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
      WHERE product_id = ? AND is_active = 1
      LIMIT 1
      `,
      [productId]
    );

    const productRows = rows as Array<{
      product_id: number;
      category_id: number;
      name: string;
      brand: string | null;
      model: string | null;
      short_tagline: string | null;
      description: string;
      price: number;
      stock_quantity: number;
      image_url: string | null;
      is_featured: number | boolean;
      is_active: number | boolean;
    }>;

    if (productRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: productRows[0],
    });
  } catch (error) {
    console.error("Error getting product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}