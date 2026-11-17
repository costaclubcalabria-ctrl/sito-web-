// Crea un account o ne reimposta la password (utile se qualcuno la dimentica).
// Uso: npm run utente -- nomeutente nuovapassword
import { PrismaClient } from "@prisma/client";
import { hashPasswordCli } from "./hash";

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 8) {
  console.error("Uso: npm run utente -- nomeutente password   (password di almeno 8 caratteri)");
  process.exit(1);
}
const db = new PrismaClient();
const u = username.toLowerCase();
db.user.upsert({ where: { username: u }, update: { passwordHash: hashPasswordCli(password) }, create: { username: u, name: u, passwordHash: hashPasswordCli(password) } })
  .then(() => console.log(`Account "${u}" pronto.`))
  .finally(() => db.$disconnect());
