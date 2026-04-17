import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET(req: Request) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  return NextResponse.redirect(new URL("/api/category", req.url));
}

export async function DELETE(_req: Request) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  try {
    await query_db("DELETE FROM categories");

    return NextResponse.json(
      {
        success: true,
        message: "All product categories have been deleted.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete categories:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product categories.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
