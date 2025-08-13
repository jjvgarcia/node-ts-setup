import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validation function
export const validateConfig = (): void => {
  const requiredEnvVars = ['NODE_ENV'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  if (config.nodeEnv === 'production' && config.security.jwtSecret === 'fallback-secret-key') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
};

export default config;
