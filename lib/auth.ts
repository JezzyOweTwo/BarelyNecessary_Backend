import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";

// this validation function will check
export async function requireAdminAuth(req: Request) :Promise<NextResponse<any>>{
    const authHeader = req.headers.get("authorization");    // retrieves authentication header token
    const token = authHeader?.split(" ")[1]; // headers come in the format: " Authorization: Bearer <token> "

    if (!token) {
        return NextResponse.json({ data: "Missing admin token!"},{ status: 401});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if ((decoded as any).role !== "admin") {
        return NextResponse.json({ data: "Forbidden: Invalid admin credentials!"},{ status: 403});
    }

  return NextResponse.json({ status: 200});
}