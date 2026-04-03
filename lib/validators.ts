import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

// this validation function will ensure that the user is logged in as an admin.
export async function requireAdminAuth(req: Request) :Promise<NextResponse<any>>{
    const authHeader = req.headers.get("authorization");    // retrieves authentication header token
    const token = authHeader?.split(" ")[1]; // headers come in the format: " Authorization: Bearer <token> "

    if (!token) {
        return NextResponse.json({ data: "Missing admin token!"},{ status: 401});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "admin" || !uuidValidate(decoded.userID)) {
        return NextResponse.json({ data: "Forbidden: Invalid admin credentials!"},{ status: 403});
    }

  return NextResponse.json({ status: 200});
}

// this validation function will ensure that the user is logged in an account.
export async function requireAuth(req: Request) :Promise<NextResponse<any>>{
    const authHeader = req.headers.get("authorization");    // retrieves authentication header token
    const token = authHeader?.split(" ")[1]; // headers come in the format: " Authorization: Bearer <token> "

    if (!token) {
        return NextResponse.json({ data: "Missing login token!"},{ status: 401});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if ((decoded.role !== "admin"&&decoded.role !== "customer") || !uuidValidate(decoded.userID)) {
        return NextResponse.json({ data: "Forbidden: malformed JWT Key"},{ status: 403});
    }

  return NextResponse.json({ status: 200});
}

// this validation function will ensure the user's ID is a present, and correctly formed UUID.
// note that it does NOT check if the session is valid or not. Call requireAuth() instead for that
export async function validateUserID(req: Request,id:String) :Promise<NextResponse<any>>{

    if (!id) {
        return NextResponse.json({ data: "Missing user ID!"},{ status: 401});
    }
    
    if (!uuidValidate(id)){
        return NextResponse.json({ data: "User ID Malformed!"},{ status: 401});
    }
    
    return NextResponse.json({ status: 200});
}