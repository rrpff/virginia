import { createHash } from "crypto";

export function hashObject(obj: object): string {
  let strs = [];
  for (const [key, value] of Object.entries(obj)) {
    strs.push(`${key}:${value}`);
  }

  const str = strs.join(";");
  return createHash("md5").update(str).digest("hex");
}
