import pino, { multistream } from 'pino';
import { env } from './env';

// Create logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.confirmPassword',
      'req.body.token',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
};

// Development configuration
if (env.NODE_ENV === 'development') {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  };
}

// Production configuration
if (env.NODE_ENV === 'production') {
  loggerConfig.base = {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'unknown',
    service: 'node-ts-api',
    version: process.env.npm_package_version || '1.0.0',
  };
}

// Create logger instance
let logger: pino.Logger;

if (env.NODE_ENV === 'production') {
  // In production, log to console and files mounted at ./logs
  const streams: any[] = [
    { stream: process.stdout },
  ];

  // App log: info and above
  const appLogDest = pino.destination({ dest: '/tmp/logs/app.log', mkdir: true, sync: false });
  streams.push({ level: 'info', stream: appLogDest });

  // Error log: error and above
  const errorLogDest = pino.destination({ dest: '/tmp/logs/error.log', mkdir: true, sync: false });
  streams.push({ level: 'error', stream: errorLogDest });

  logger = pino(loggerConfig, multistream(streams));
} else {
  // Development/test: console only
  logger = pino(loggerConfig);
}

// Export logger for use in other modules
export { logger };
export default logger;

// Emit a startup log in production to ensure log files are created
try {
  if (env.NODE_ENV === 'production') {
    logger.info({ pid: process.pid }, 'Logger initialized');
  }
} catch {
  // noop
}
