import { NextRequest, NextResponse } from "next/server";
import { get_server_auth_token } from "@/lib/server_init";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, ...updateFields } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "Missing product_id." },
        { status: 400 }
      );
    }

    const token = await get_server_auth_token();

    const res = await fetch(
      `http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/admin/product/${product_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateFields),
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to update product.",
          error: data?.error || null,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data?.message || "Product updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bridge update route failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Bridge update route failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}