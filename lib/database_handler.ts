//import { ReturnModelType } from "@typegoose/typegoose";
import mysql from "mysql2/promise";
// TODO: add a 'query' class to make searching by parameters easier
// TODO: add another method for searching by a query
// this shit is completely untested, lmfao. I'm going based on pure vibes atm.

// params: 
// queries for every instance of that model in the database. 

// returns:
// an array of that model
type SqlValue = string | number | boolean | Date | null;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
export async function query<T = unknown>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}
export async function getAll<T>(table: string): Promise<T[]> {
  const [rows] = await pool.query(`SELECT * FROM ${table}`);
  return rows as T[];
}

export async function getFirst<T>(table: string): Promise<T | null> {
  const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT 1`);
  const result = rows as T[];
  return result[0] ?? null;
}

export async function getById<T>(table: string, idColumn: string, id: number): Promise<T | null>{
    const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${idColumn}= ? LIMIT 1`, [id]);
    const result = rows as T[];
    return result[0] ?? null;
}
export async function exists(table: string, column: string, value: SqlValue): Promise<boolean>{
    const [rows] = await pool.execute(`SELECT 1 FROM ${table} WHERE ${column}= ? LIMIT 1`, [value]);
    const result = rows as unknown[];
    return result.length>0;
}

pool.getConnection()
  .then((connection) => {
    console.log("Database connected successfully.");
    connection.release();
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
// export async function getAll<T extends Object>(model:ReturnModelType<any>,cls: new () => T):Promise<T[]>{
//     const all_results = await model.find().lean().exec();
//     const typed_results:T[] = []; 

//     for (const result of all_results){
//         typed_results.push(Object.assign(new cls(), result));
//     }

//     return typed_results;
// }

// returns:
// the first instance of a given model in the database
// export async function getFirst<T extends Object>(model:ReturnModelType<any>,cls: new () => T):Promise<T>{
//     const result = await model.findOne().lean().exec();
//     const typed_result:T = Object.assign(new cls(), result);
//     return typed_result;
// }

// // returns:
// // Applies a search query and returns an array of all matching objects


// // returns:
// //  the object with a matching Mongo DB id in the database.
// export async function getById<T extends Object>(model:ReturnModelType<any>,id:string,cls: new () => T):Promise<T>{
//     const result = await model.findById(id).lean().exec();
//     const typed_result:T = Object.assign(new cls(), result);
//     return typed_result;
// }

// // returns a boolean on whether or not the model exists
// export async function exists<T extends Object>(model:ReturnModelType<any>,filter:object,cls: new () => T):Promise<Boolean>{
//     return await model.exists(filter).lean().exec();
// }

