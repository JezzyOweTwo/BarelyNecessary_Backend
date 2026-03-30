import { NextResponse } from "next/server";
import {query_db} from "@/lib/database_handler";

export async function GET() {
  try {
    const [rows] = await query_db("SELECT 1 AS test");
    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      rows,
    });
  } catch (error) {
    console.error("DB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}