import { env, validateEnv } from './env';

interface Config {
  port: number;
  nodeEnv: string;
  api: {
    version: string;
    prefix: string;
  };
  security: {
    jwtSecret: string;
    corsOrigin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  api: {
    version: env.API_VERSION,
    prefix: env.API_PREFIX,
  },
  security: {
    jwtSecret: env.JWT_SECRET,
    corsOrigin: env.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
};

// Export validation function
export const validateConfig = validateEnv;

export default config;
