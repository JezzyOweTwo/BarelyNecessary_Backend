import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

async function getClient(): Promise<RedisClientType> {
  try {
    if (client) return client;

    client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      database: 0
    });

    client.on("error", (err) => console.error("Redis error:", err));

    await client.connect();
    console.log("Redis connected");

    return client;
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    throw new Error("Failed to connect to Redis");
  }
}

/* Set a value */
export async function redisSet(key: string, value: string, expirationSeconds?: number): Promise<void> {
  try {
    const client = await getClient();

    const result = expirationSeconds
      ? await client.set(key, value, { EX: expirationSeconds })
      : await client.set(key, value);

    if (result !== "OK") {
      throw new Error(`Redis SET failed for key '${key}'`);
    }
  } 
  catch (err) {
    console.error(err);
    throw err;
  }
}

/* Get a value */
export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = await getClient();
    return await client.get(key);
  } 
  
  catch (err) {
    console.error(`Redis GET failed for key '${key}':`, err);
    throw err;
  }
}

/* Delete a value */
export async function redisDelete(key: string): Promise<void> {
  try {
    const client = await getClient();
    const result = await client.del(key);

    if (result !== 1) {
      throw new Error(`Redis DELETE failed — key '${key}' not found`);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* Check existence */
export async function redisExists(key: string): Promise<boolean> {
  try {
    const client = await getClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (err) {
    console.error(`Redis EXISTS failed for key ${key}`);
    throw err;
  }
}

/* Set JSON value */
export async function redisSetJSON(key: string, value: unknown, expirationSeconds?: number): Promise<void> {
 // console.log(`Recieved: key:${key} value:${value} expiration:${expirationSeconds}`)
  try {
    const json = JSON.stringify(value);
    await redisSet(key, json, expirationSeconds);
  } 
  
  catch (err) {
    console.error(`Redis SET JSON failed for key '${key}'`);
    throw err;
  }
}

/* Get JSON value */
export async function redisGetJSON<T>(key: string): Promise<T | null> {
  try {
    const value = await redisGet(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } 
  
  catch (err) {
    console.error(`Redis GET JSON failed for key '${key}':`);
    throw err;
  }
}

/* Test Redis Connection */
export async function testRedis(): Promise<void> {
  try {

    console.log("Testing Redis connection...");
    const client = await getClient();

    // test redis
    const testKey = "test:connection";
    const testValue = "hello-redis";

    const setResult = await client.set(testKey, testValue, { EX: 30 });

    if (setResult !== "OK") {
      throw new Error("Redis SET test failed");
    }

    const value = await client.get(testKey);

    if (value !== testValue) {
      throw new Error(
        `Redis test failed. Expected '${testValue}', got '${value}'`
      );
    }

    console.log("Redis test successful!");
  } catch (err) {
    console.error("Redis test failed:", err);
    throw err;
  }
}