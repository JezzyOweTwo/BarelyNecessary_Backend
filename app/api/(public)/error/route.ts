import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    return NextResponse.json({ message: "Route not found" }, { status: 404 });
}