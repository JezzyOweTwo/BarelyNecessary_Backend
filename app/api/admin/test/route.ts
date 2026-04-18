import { NextRequest, NextResponse } from "next/server";
import { testRedis } from "@/lib/redis_handler";
import {test_db} from "@/lib/database_handler";


export async function GET(req: NextRequest) {
  console.log("App starting...");

  try{
      // tests db
    // await test_db();

    // test redis connection
    await  testRedis();

  } catch (err){
    console.error(err);
    return NextResponse.json(
      { message: "Some error has occured." },
      { status: 500 }
    );
  }
    return NextResponse.json(
        { message: "You made it out the hood!" },
        { status: 200 }
    );

}