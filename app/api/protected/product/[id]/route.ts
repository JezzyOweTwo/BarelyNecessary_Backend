import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";
import { RouteContext } from "@/lib/types";
import { Product } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET(_request: Request, context: RouteContext<{id:string}>) {
  // ensures the user is authenticated before proceeding.
  const validation = await guardRoute(requireAuth,false);
  if (validation) return validation;
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await query_db(
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
    ) as Product[];

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product[0],
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