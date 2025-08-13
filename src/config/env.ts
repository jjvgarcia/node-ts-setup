import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api'),
  API_VERSION: z.string().default('v1'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
});

export type Env = z.infer<typeof EnvSchema>;

// Parse and validate environment variables
export const env = EnvSchema.parse(process.env);

// Validation function for additional checks
export const validateEnv = (): void => {
  // Additional validation for production
  if (env.NODE_ENV === 'production') {
    if (env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET should be at least 32 characters in production');
    }

    if (env.PORT < 1024 && process.getuid && process.getuid() !== 0) {
      console.warn('Warning: Running on privileged port without root privileges');
    }
  }

  console.log(`✅ Environment validation passed (${env.NODE_ENV})`);
};
