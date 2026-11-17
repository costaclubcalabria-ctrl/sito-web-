// Copia di sicurezza del database. Uso: npm run db:backup
// Usa VACUUM INTO di SQLite: la copia è coerente anche con l'app accesa.
import { PrismaClient } from "@prisma/client";
import { mkdirSync } from "node:fs";
import path from "node:path";

const db = new PrismaClient();
const dir = path.resolve(process.cwd(), "backup");
mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const file = path.join(dir, `foodcost-${stamp}.db`);

db.$executeRawUnsafe(`VACUUM INTO '${file.replace(/'/g, "''")}'`)
  .then(() => console.log(`Backup salvato in ${file}`))
  .catch((e) => { console.error("Backup NON riuscito:", e.message); process.exitCode = 1; })
  .finally(() => db.$disconnect());
