import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";

export async function GET(req: Request) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  return NextResponse.redirect(new URL("/api/product", req.url));
}

export async function DELETE(_req: Request) {
  const validation = await guardRoute(requireAuth, true);
  if (validation) return validation;

  try {
    await query_db("DELETE FROM products");

    return NextResponse.json(
      {
        success: true,
        message: "All products have been deleted.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete products.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
