import "dotenv/config"; // load .env
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: {
    provider: "postgresql",
    url: process.env.DATABASE_URL, // must point to a real DB
  },
});

export default prisma;
