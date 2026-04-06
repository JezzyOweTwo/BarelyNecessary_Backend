import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database_handler";
import { User } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { validateUserID } from "@/lib/validators";

const TABLE = "users";          // table name
const ID_COLUMN = "user_id";    // primary key column

// GET: fetch a user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const userId:string = params.id;

    // ensures caller passed a valid UUID.
    const validator = guardRoute(req,true,validateUserID,userId);    // returns null if valid, 
    if (validator) return validator;                                 // returns redirection object if validation failed

    const user = await db.getById<User>(TABLE, ID_COLUMN, userId);
    if (!user) return NextResponse.json({ data: "User not found" }, { status: 404 });

    const { password, ...safeUser } = user;
    return NextResponse.json({ data: safeUser });
}

// PATCH: update user fields dynamically
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const userId:string = params.id;

    // ensures caller passed a valid UUID.
    const validator = guardRoute(req,true,validateUserID,userId);    // returns null if valid, 
    if (validator) return validator;                                 // returns redirection object if validation failed
    const body = await req.json();

    // Pick only fields allowed to update
    const allowedFields: (keyof User)[] = [
        "first_name",
        "last_name",
        "email",
        "username",
        "phone",
        "role",
        "is_active",
    ];

  const updates: Partial<User> = {};
  for (const field of allowedFields) {
        if (field in body) {
            updates[field] = body[field];
        }
  }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ data: "No valid fields to update" }, { status: 400 });
    }

    // Dynamically build the SQL SET clause
    const setClause = Object.keys(updates)
        .map((key) => `\`${key}\` = ?`)
        .join(", ");
    const values = Object.values(updates);

    const result = await db.query_db<User>(
        `UPDATE \`${TABLE}\` SET ${setClause} WHERE \`${ID_COLUMN}\` = ?`,
        [...values, userId]
    );

    // Return updated user
    const updatedUser = await db.getById<User>(TABLE, ID_COLUMN, userId);
    if (!updatedUser) return NextResponse.json({ data: "User not found after update" }, { status: 404 });

    const { password, ...safeUser } = updatedUser;
    return NextResponse.json({ data: safeUser });
}

// DELETE: remove a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const userId:string = params.id;

    // ensures caller passed a valid UUID.
    const validator = guardRoute(req,true,validateUserID,userId);    // returns null if valid, 
    if (validator) return validator;                                 // returns redirection object if validation failed

    const user = await db.getById<User>(TABLE, ID_COLUMN, userId);
    if (!user) return NextResponse.json({ data: "User not found" }, { status: 404 });

    await db.query_db(`DELETE FROM \`${TABLE}\` WHERE \`${ID_COLUMN}\` = ?`, [userId]);
    return NextResponse.json({ data: "User deleted successfully" });
}