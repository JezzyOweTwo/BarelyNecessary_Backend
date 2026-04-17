import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { RouteContext } from "@/lib/types";
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
  const categoryId = parseId(id);

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid category ID." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/api/category/${categoryId}`, req.url));
}

export async function POST(req: Request, context: RouteContext<{ id: string }>) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  const { id } = await context.params;
  const categoryId = parseId(id);
  const body = await req.json();
  const { category_name, description } = body;

  if (!category_name) {
    return NextResponse.json(
      { success: false, message: "Missing required field: category_name." },
      { status: 400 }
    );
  }

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid category ID." },
      { status: 400 }
    );
  }

  try {
    const existing = await query_db(
      `SELECT category_id FROM categories WHERE category_id = ? LIMIT 1`,
      [categoryId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Category with ID ${categoryId} already exists.` },
        { status: 409 }
      );
    }

    await query_db(
      `INSERT INTO categories (category_id, category_name, description) VALUES (?, ?, ?)`,
      [categoryId, category_name, description ?? null]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        data: {
          category_id: categoryId,
          category_name,
          description: description ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create category:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category.",
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
  const categoryId = parseId(id);
  const body = await req.json();
  const { category_name, description } = body;

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid category ID." },
      { status: 400 }
    );
  }

  if (!category_name && description === undefined) {
    return NextResponse.json(
      { success: false, message: "Missing fields to update. Provide category_name or description." },
      { status: 400 }
    );
  }

  try {
    const existing = await query_db(
      `SELECT category_id, category_name, description FROM categories WHERE category_id = ? LIMIT 1`,
      [categoryId]
    ) as Array<{ category_id: number; category_name: string; description: string | null }>;

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: `Category with ID ${categoryId} not found.` },
        { status: 404 }
      );
    }

    await query_db(
      `UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?`,
      [category_name ?? existing[0].category_name, description ?? existing[0].description, categoryId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update category:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category.",
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
  const categoryId = parseId(id);

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid category ID." },
      { status: 400 }
    );
  }

  try {
    const result = await query_db(
      `DELETE FROM categories WHERE category_id = ?`,
      [categoryId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete category:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
