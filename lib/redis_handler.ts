import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client) return client;

  client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` 
  });

  client.on("error", (err) => console.error("Redis error:", err));

  await client.connect();
  return client;
}

/* Set a value */
export async function redisSet(key: string, value: string, expirationSeconds?: number): Promise<void> {
  const client = await getClient();

  if (expirationSeconds) {
    await client.set(key, value, { EX: expirationSeconds });
  } else {
    await client.set(key, value);
  }
}

/* Get a value */
export async function redisGet(key: string): Promise<string | null> {
  const client = await getClient();
  return client.get(key);
}

/* Delete a value */
export async function redisDelete(key: string): Promise<void> {
  const client = await getClient();
  await client.del(key);
}

/* Check existence */
export async function redisExists(key: string): Promise<boolean> {
  const client = await getClient();
  const result = await client.exists(key);
  return result === 1;
}

/* Set JSON value */
export async function redisSetJSON(
  key: string,
  value: unknown,
  expirationSeconds?: number
): Promise<void> {
  const json = JSON.stringify(value);
  await redisSet(key, json, expirationSeconds);
}

/* Get JSON value */
export async function redisGetJSON<T>(key: string): Promise<T | null> {
  const value = await redisGet(key);
  if (!value) return null;

  try {return JSON.parse(value) as T;}
  catch {return null;}
}

export async function test(): Promise<void> {
  try {
    const client = await getClient();

    console.log("Connected to Redis! Testing read/write...");

    const testKey = "test:connection";
    const testValue = "hello-redis";

    // set key with a short TTL
    await client.set(testKey, testValue, { EX: 30 });

    // read it back
    const value = await client.get(testKey);

    if (value === testValue) {
      console.log(`Redis test successful! Key '${testKey}' = '${value}'`);
    } else {
      console.log(`Redis test failed. Expected '${testValue}', got '${value}'`);
    }

    // clean up
    await client.del(testKey);
  } catch (err) {
    console.error("Redis test failed:", err);
  }
}