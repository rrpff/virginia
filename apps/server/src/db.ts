import { PrismaClient } from "@prisma/client";
import path from "path";
import os from "os";

export const DATABASE_URL =
  process.env.NODE_ENV === "production"
    ? `file:${path.join(os.homedir(), "virginia.db")}`
    : "file:./dev.db";

export default new PrismaClient({
  datasourceUrl: DATABASE_URL,
});
