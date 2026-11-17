import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const COOKIE = "fc_sessione";
const DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, Buffer.from(salt, "hex"), 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession(userId: number) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DAYS * 86400_000);
  await db.session.create({ data: { id, userId, expiresAt } });
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const https = (await headers()).get("x-forwarded-proto") === "https";
  (await cookies()).set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: https, path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.session.deleteMany({ where: { id } });
  jar.delete(COOKIE);
}

export async function currentUser() {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const s = await db.session.findUnique({ where: { id }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return { id: s.user.id, username: s.user.username, name: s.user.name };
}

/** Da chiamare in ogni pagina, azione e route protetta. */
export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}
