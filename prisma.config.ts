import { defineConfig } from "prisma/config";

// Load environment variables from .env when using Prisma Config
// Without this, Prisma skips env loading if a config file is present.
// Requires Node.js v20+.
process.loadEnvFile?.();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
