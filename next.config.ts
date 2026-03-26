// next.config.ts
import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load .env at build time
dotenv.config();

const nextConfig: NextConfig = {
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    APP_PORT: process.env.APP_PORT,
  },
};

export default nextConfig;