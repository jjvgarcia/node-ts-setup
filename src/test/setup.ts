import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { prisma } from '@config/prisma';

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  // Prefer TEST_DATABASE_URL, fallback to host Postgres (docker-compose exposes 5432)
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/node_ts_api?schema=public';

  // Run migrations for test database
  // Use db push since the project relies on push at runtime
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});
