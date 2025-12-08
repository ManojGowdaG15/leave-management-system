import pkg from "@prisma/client";
import { PrismaClient } from "./generated/prisma"; // if using custom output
const prisma = new PrismaClient();
export default prisma;

