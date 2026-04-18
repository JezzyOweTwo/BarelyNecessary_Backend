import { createClient, RedisClientType } from "redis";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Hash } from "@aws-sdk/hash-node";
import { HttpRequest } from "@aws-sdk/protocol-http";

let client: RedisClientType | null = null;

async function getElastiCacheAuthToken(): Promise<string> {
  const host = process.env.REDIS_HOST;
  const userId = process.env.REDIS_USER;
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? process.env.NEXT_PUBLIC_S3_REGION;

  if (!host || !userId) {
    throw new Error("REDIS_HOST and REDIS_USER are required to generate an ElastiCache auth token.");
  }

  if (!region) {
    throw new Error("AWS_REGION or AWS_DEFAULT_REGION is required to generate an ElastiCache auth token.");
  }

  try {
    const signer = new SignatureV4({
      service: "elasticache",
      region,
      credentials: await defaultProvider()(),
      sha256: Hash.bind(null, "sha256")
    });

    const request = new HttpRequest({
      protocol: "https:",
      hostname: host,
      method: "GET",
      path: "/",
      headers: {
        host: host
      }
    });

    const signedRequest = await signer.sign(request);
    const authValue = signedRequest.headers["authorization"];

    if (!authValue || typeof authValue !== "string") {
      throw new Error("Failed to generate ElastiCache auth token.");
    }

    // Extract token from Authorization header (format: "AWS4-HMAC-SHA256 ...")
    return authValue;
  } catch (err) {
    console.error("Error generating ElastiCache auth token:", err);
    throw err;
  }
}

async function getClient(): Promise<RedisClientType> {
  try {
    if (client) return client;

    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);
    const userId = process.env.REDIS_USER;
    const password = process.env.REDIS_PASSWORD;

    if (!host) {
      throw new Error("REDIS_HOST environment variable is required.");
    }

    // ElastiCache with IAM auth (requires username, no password set, and AWS credentials)
    if (userId && !password) {
      console.log("Connecting to ElastiCache with IAM authentication...");
      const authToken = await getElastiCacheAuthToken();

      client = createClient({
        socket: {
          host,
          port,
          tls: true
        },
        username: userId,
        password: authToken,
        database: 0
      });
    }
    // Local Redis with password
    else if (password) {
      console.log("Connecting to local Redis with password...");
      client = createClient({
        socket: {
          host,
          port
        },
        password,
        database: 0
      });
    }
    // Local Redis without auth
    else {
      console.log("Connecting to local Redis without authentication...");
      client = createClient({
        socket: {
          host,
          port
        },
        database: 0
      });
    }

    client.on("error", (err) => console.error("Redis error:", err));

    await client.connect();
    console.log("Redis connected successfully");

    return client;
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    throw new Error(`Failed to connect to Redis: ${err instanceof Error ? err.message : String(err)}`);
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