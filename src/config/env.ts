import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_REDIRECT_URI: z.url(),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default(3000),
  BACKEND_URL: z.url(),
  FRONTEND_URL: z.url()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsedEnv.error));
  process.exit(1);
}

export const env = parsedEnv.data;
