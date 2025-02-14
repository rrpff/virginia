import os from "os";
import path from "path";
import { PrismaClient } from "@prisma/client";

export const DATABASE_URL =
  process.env.NODE_ENV === "development"
    ? "./dev.db"
    : path.join(os.homedir(), "virginia.db");

export default new PrismaClient({
  datasourceUrl: `file:${DATABASE_URL}`,
});
