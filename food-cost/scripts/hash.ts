import { randomBytes, scryptSync } from "node:crypto";

// Stesso formato di src/lib/auth.ts (che non si può importare fuori da Next).
export function hashPasswordCli(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}
