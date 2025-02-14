import os from "os";
import path from "path";
import { PrismaClient } from "@prisma/client";

export const DATABASE_URL =
  process.env.NODE_ENV === "production"
    ? path.join(os.homedir(), "virginia.db")
    : "./dev.db";

export default new PrismaClient({
  datasourceUrl: `file:${DATABASE_URL}`,
});
