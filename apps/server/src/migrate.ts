import { exec, execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { DATABASE_URL } from "./db.js";

const PRISMA_CLI = path.join(__dirname, "../../../../node_modules/prisma/build/index.js");

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export async function migrate() {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV !== "production") {
    console.info("Skipping migrate in non-production environment");
    return;
  }

  console.log({ DATABASE_URL });

  // const ls = await execAsync("ls -laR /snapshot");
  // console.log(ls.stdout);
  // console.error(ls.stderr);

  console.log({ PRISMA_CLI });

  const { stdout, stderr } = await execFileAsync(
    PRISMA_CLI,
    ["migrate", "deploy"],
    {
      env: {
        DATABASE_URL: DATABASE_URL,
      },
    }
  );

  console.info(stdout);
  if (stderr) {
    console.error(stderr);
  }
}
