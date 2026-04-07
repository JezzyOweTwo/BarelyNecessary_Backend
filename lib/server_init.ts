import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
var SYS_AUTH_TOKEN:string;

// create auth token
export async function get_server_auth_token():Promise<string>{
    if (SYS_AUTH_TOKEN)
        return SYS_AUTH_TOKEN;

    SYS_AUTH_TOKEN = jwt.sign(
        { 
            userId: uuidv4(), 
            role: 'admin' 
        },
        process.env.JWT_SECRET!
    );
     
    console.log(`Server init: ${SYS_AUTH_TOKEN}`); 
    return SYS_AUTH_TOKEN;
}