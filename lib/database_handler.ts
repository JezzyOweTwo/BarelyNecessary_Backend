import mysql, { Pool, PoolConnection } from "mysql2/promise";

type SqlValue = string | number | boolean | Date | null;

let pool: Pool | null = null;

/* Initialize the database connection pool. */
async function init_db(): Promise<Pool> {
  if (pool) return pool;

  const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

/* Test the database connection. */
export async function test_db(): Promise<void> {
  const poolInstance = await getPool();
  let connection: PoolConnection | null = null;

  try {
    connection = await poolInstance.getConnection();
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  } finally {
    connection?.release();
  }
}

/* Get the pool instance, initializing it if necessary. */
async function getPool(): Promise<Pool> {
  if (!pool) return await init_db();
  return pool;
}

/* Execute a parameterized SQL query. */
export async function query_db<T = unknown>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const poolInstance = await getPool();
  const [rows] = await poolInstance.execute(sql, params);
  return rows as T[];
}

/* Get all rows from a table. */
export async function getAll<T = unknown>(table: string): Promise<T[]> {
  const poolInstance = await getPool();
  const [rows] = await poolInstance.query(`SELECT * FROM \`${table}\``);
  return rows as T[];
}

/* Get the first row from a table. */
export async function getFirst<T = unknown>(table: string): Promise<T | null> {
  const poolInstance = await getPool();
  const [rows] = await poolInstance.query(`SELECT * FROM \`${table}\` LIMIT 1`);
  const result = rows as T[];
  return result[0] ?? null;
}

/* Get a row by its ID. */
export async function getById<T = unknown>(
  table: string,
  idColumn: string,
  id: number | string // user IDS are strings, but category IDs are numbers, for example.
): Promise<T | null> {
  const poolInstance = await getPool();
  const [rows] = await poolInstance.execute(
    `SELECT * FROM \`${table}\` WHERE \`${idColumn}\` = ? LIMIT 1`,
    [id]
  );
  const result = rows as T[];
  return result[0] ?? null;
}

/* Check if a value exists in a column. */
export async function exists(table: string, column: string, value: SqlValue): Promise<boolean> {
  const poolInstance = await getPool();
  const [rows] = await poolInstance.execute(
    `SELECT 1 FROM \`${table}\` WHERE \`${column}\` = ? LIMIT 1`,
    [value]
  );
  const result = rows as unknown[];
  return result.length > 0;
}

export default {
  test_db,
  query_db,
  getAll,
  getFirst,
  getById,
  exists,
};