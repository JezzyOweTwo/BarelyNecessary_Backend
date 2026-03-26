import mysql, { Pool } from "mysql2/promise"; // try not to call pool if you dont have to. 

/* =========================
   Types
========================= */
type SqlValue = string | number | boolean | Date | null ;

/* =========================
   Global Pool (Next.js safe)
========================= */
declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: Pool | undefined;
}

/* =========================
   Env Validation
========================= */
const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/* =========================
   Create / Reuse Pool
========================= */
const pool =
  global.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  
/* =========================
   Helper Functions
========================= */

// Generic query (recommended)
export async function query_db<T = unknown>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

// Get all rows from a table
export async function getAll<T>(table: string): Promise<T[]> {
  const [rows] = await pool.query(`SELECT * FROM ${table}`);
  return rows as T[];
}

// Get first row
export async function getFirst<T>(table: string): Promise<T | null> {
  const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT 1`);
  const result = rows as T[];
  return result[0] ?? null;
}

// Get by ID
export async function getById<T>(table: string, idColumn: string,id: number): Promise<T | null> {
  const [rows] = await pool.execute(
    `SELECT * FROM ${table} WHERE ${idColumn} = ? LIMIT 1`,
    [id]
  );
  const result = rows as T[];
  return result[0] ?? null;
}

// Check existence
export async function exists(table: string, column: string, value: SqlValue): Promise<boolean> {
  const [rows] = await pool.execute(
    `SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`,
    [value]
  );
  const result = rows as unknown[];
  return result.length > 0;
}

/* =========================
   Connection Test (optional)
========================= */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully.");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// Run once (optional, safe)
testConnection();

/* =========================
   Export
========================= */
export default pool;