import "dotenv/config"; // loads .env automatically
import { PrismaConfig } from "@prisma/client";

const config: PrismaConfig = {
  db: {
    adapter: "postgresql",
    url: process.env.DATABASE_URL, // loads your DATABASE_URL from .env
  },
};

export default config;
