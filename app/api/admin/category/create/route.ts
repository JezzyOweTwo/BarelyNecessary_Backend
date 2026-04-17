import { NextRequest, NextResponse } from "next/server";
import { get_server_auth_token } from "@/lib/server_init";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, category_name, description } = body;

    if (!category_id) {
      return NextResponse.json(
        { success: false, message: "Missing category_id." },
        { status: 400 }
      );
    }

    if (!category_name) {
      return NextResponse.json(
        { success: false, message: "Missing category_name." },
        { status: 400 }
      );
    }

    const token = await get_server_auth_token();

    const res = await fetch(
      `http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/admin/category/${category_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_name,
          description,
        }),
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to create category.",
          error: data?.error || null,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data?.message || "Category created successfully.",
        data: data?.data || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bridge category create route failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Bridge category create route failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}