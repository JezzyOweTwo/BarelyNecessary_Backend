import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { RouteContext, Product } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

function parseId(id: string | undefined): number | null {
  if (!id) return null;
  const parsed = Number(id);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET(req: Request, context: RouteContext<{ id: string }>) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  const { id } = await context.params;
  const productId = parseId(id);

  if (productId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/api/product/${productId}`, req.url));
}

export async function POST(req: Request, context: RouteContext<{ id: string }>) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  const { id } = await context.params;
  const productId = parseId(id);
  const body = await req.json();
  const {
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
    is_active,
  } = body;

  if (productId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID." },
      { status: 400 }
    );
  }

  const missingFields = [];
  if (category_id === undefined || category_id === null) missingFields.push("category_id");
  if (!name) missingFields.push("name");
  if (!description) missingFields.push("description");
  if (price === undefined || price === null) missingFields.push("price");
  if (stock_quantity === undefined || stock_quantity === null) missingFields.push("stock_quantity");

  if (missingFields.length > 0) {
    return NextResponse.json(
      { success: false, message: `Missing required field(s): ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const existing = await query_db(
      `SELECT product_id FROM products WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Product with ID ${productId} already exists.` },
        { status: 409 }
      );
    }

    await query_db(
      `INSERT INTO products
        (product_id, category_id, name, brand, model, short_tagline, description, price, stock_quantity, image_url, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        category_id,
        name,
        brand ?? null,
        model ?? null,
        short_tagline ?? null,
        description,
        price,
        stock_quantity,
        image_url ?? null,
        is_featured === undefined ? false : is_featured,
        is_active === undefined ? true : is_active,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: {
          product_id: productId,
          category_id,
          name,
          brand: brand ?? null,
          model: model ?? null,
          short_tagline: short_tagline ?? null,
          description,
          price,
          stock_quantity,
          image_url: image_url ?? null,
          is_featured: is_featured === undefined ? false : is_featured,
          is_active: is_active === undefined ? true : is_active,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: RouteContext<{ id: string }>) {
  const validation = await guardRoute(requireAuth, true);   
  if (validation) return validation;

  const { id } = await context.params;
  const productId = parseId(id);
  const body = await req.json();
  const {
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
    is_active,
  } = body;

  if (productId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID." },
      { status: 400 }
    );
  }

  if (
    category_id === undefined &&
    name === undefined &&
    brand === undefined &&
    model === undefined &&
    short_tagline === undefined &&
    description === undefined &&
    price === undefined &&
    stock_quantity === undefined &&
    image_url === undefined &&
    is_featured === undefined &&
    is_active === undefined
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing fields to update. Provide at least one product field.",
      },
      { status: 400 }
    );
  }

  try {
    const existing = await query_db(
      `SELECT * FROM products WHERE product_id = ? LIMIT 1`,
      [productId]
    ) as Product[];

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: `Product with ID ${productId} not found.` },
        { status: 404 }
      );
    }

    const current = existing[0];

    await query_db(
      `UPDATE products SET
        category_id = ?,
        name = ?,
        brand = ?,
        model = ?,
        short_tagline = ?,
        description = ?,
        price = ?,
        stock_quantity = ?,
        image_url = ?,
        is_featured = ?,
        is_active = ?
      WHERE product_id = ?`,
      [
        category_id === undefined ? current.category_id : category_id,
        name === undefined ? current.name : name,
        brand === undefined ? current.brand ?? null : brand,
        model === undefined ? current.model ?? null : model,
        short_tagline === undefined ? current.short_tagline ?? null : short_tagline,
        description === undefined ? current.description : description,
        price === undefined ? current.price : price,
        stock_quantity === undefined ? current.stock_quantity : stock_quantity,
        image_url === undefined ? current.image_url ?? null : image_url,
        is_featured === undefined ? current.is_featured : is_featured,
        is_active === undefined ? current.is_active : is_active,
        productId,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext<{ id: string }>) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  const { id } = await context.params;
  const productId = parseId(id);

  if (productId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID." },
      { status: 400 }
    );
  }

  try {
    const existing = await query_db(
      `SELECT product_id FROM products WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: `Product with ID ${productId} not found.` },
        { status: 404 }
      );
    }

    await query_db(
      `DELETE FROM products WHERE product_id = ?`,
      [productId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
