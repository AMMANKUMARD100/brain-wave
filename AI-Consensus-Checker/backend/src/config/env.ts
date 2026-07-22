import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(12000),
  RESPONSE_CACHE_TTL_MS: z.coerce.number().default(60_000),
  COSINE_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.84),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
