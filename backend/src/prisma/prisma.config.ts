// prisma/prisma.config.ts
import { PrismaConfig } from "@prisma/client";

const config: PrismaConfig = {
  db: {
    adapter: "postgresql",
    url: process.env.DATABASE_URL, // ensure .env exists
  },
};

export default config;
