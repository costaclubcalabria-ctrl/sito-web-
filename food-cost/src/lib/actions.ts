"use server";

import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "./auth";
import { loadAll } from "./data";
import { Engine, newlyOverTarget, wouldCreateCycle, type RecipeInput } from "./engine/cost";
import { dimensionOf, isUnit, type Unit } from "./engine/units";
import { parseDecimal } from "./format";
import { mapRows, normalizeUnit, parseCsv, parseXlsx } from "./import";

export type State = { error?: string; ok?: string; details?: string[] } | null;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ───────────────────────────── Accesso ─────────────────────────────

export async function login(_: State, fd: FormData): Promise<State> {
  const username = str(fd, "username").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = await db.user.findUnique({ where: { username } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    await new Promise((r) => setTimeout(r, 600)); // rallenta i tentativi a raffica
    return { error: "Nome utente o password non corretti." };
  }
  await createSession(user.id);
  redirect("/");
}

/** Primo avvio: crea il primo account. Funziona solo se non esiste ancora nessun utente. */
export async function setupFirstUser(_: State, fd: FormData): Promise<State> {
  if ((await db.user.count()) > 0) return { error: "Esiste già un account: accedi." };
  const v = validateUser(fd);
  if ("error" in v) return v;
  const user = await db.user.create({ data: { username: v.username, name: v.name, passwordHash: hashPassword(v.password) } });
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

function validateUser(fd: FormData): { username: string; name: string; password: string } | { error: string } {
  const username = str(fd, "username").toLowerCase();
  const name = str(fd, "name") || username;
  const password = String(fd.get("password") ?? "");
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return { error: "Nome utente: da 3 a 30 caratteri, solo lettere minuscole, numeri, punto e trattino." };
  if (password.length < 8) return { error: "La password deve avere almeno 8 caratteri." };
  return { username, name, password };
}

export async function addUser(_: State, fd: FormData): Promise<State> {
  await requireUser();
  const v = validateUser(fd);
  if ("error" in v) return v;
  if (await db.user.findUnique({ where: { username: v.username } })) return { error: "Nome utente già usato." };
  await db.user.create({ data: { username: v.username, name: v.name, passwordHash: hashPassword(v.password) } });
  revalidatePath("/impostazioni");
  return { ok: `Account "${v.username}" creato.` };
}

export async function changePassword(_: State, fd: FormData): Promise<State> {
  const me = await requireUser();
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "La password deve avere almeno 8 caratteri." };
  await db.user.update({ where: { id: me.id }, data: { passwordHash: hashPassword(password) } });
  return { ok: "Password aggiornata." };
}

export async function deleteUser(id: number, _: State): Promise<State> {
  const me = await requireUser();
  if (me.id === id) return { error: "Non puoi eliminare il tuo account." };
  await db.user.delete({ where: { id } });
  revalidatePath("/impostazioni");
  return null;
}

// ─────────────────────────── Impostazioni ───────────────────────────

export async function saveSettings(_: State, fd: FormData): Promise<State> {
  await requireUser();
  const target = parseDecimal(fd.get("targetFoodCostPct"));
  const vat = parseDecimal(fd.get("vatPct"));
  const receipt = parseDecimal(fd.get("targetReceipt"));
  if (!target || new Decimal(target).lte(0) || new Decimal(target).gte(100)) return { error: "Food cost obiettivo: inserisci una percentuale tra 1 e 99." };
  if (!vat || new Decimal(vat).lt(0) || new Decimal(vat).gte(100)) return { error: "IVA: inserisci una percentuale valida." };
  if (!receipt || new Decimal(receipt).lte(0)) return { error: "Scontrino obiettivo: inserisci un importo maggiore di zero." };
  const data = { targetFoodCostPct: target, vatPct: vat, targetReceipt: receipt };
  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: "Impostazioni salvate." };
}

// ──────────────────────────── Ingredienti ────────────────────────────

type IngredientData = {
  name: string; category: string; supplier: string; purchaseQty: string; purchaseUnit: Unit;
  price: string; yieldPct: string; pieceWeightG: string | null; notes: string;
};

function validateIngredient(raw: {
  name: string; category: string; supplier: string; purchaseQty: string; purchaseUnit: string;
  price: string; yieldPct: string; pieceWeightG: string; notes: string;
}): IngredientData | { error: string } {
  if (!raw.name) return { error: "Manca il nome." };
  const unit = normalizeUnit(raw.purchaseUnit);
  if (!unit || !isUnit(unit)) return { error: `Unità di acquisto non riconosciuta: "${raw.purchaseUnit}" (usa kg, g, l, ml o pz).` };
  const qty = raw.purchaseQty === "" ? "1" : parseDecimal(raw.purchaseQty);
  if (!qty || new Decimal(qty).lte(0)) return { error: "Quantità della confezione non valida." };
  const price = parseDecimal(raw.price);
  if (!price || new Decimal(price).lt(0)) return { error: "Prezzo non valido." };
  const y = raw.yieldPct === "" ? "100" : parseDecimal(raw.yieldPct);
  if (!y || new Decimal(y).lte(0) || new Decimal(y).gt(100)) return { error: "La resa deve essere tra 1 e 100." };
  let pw: string | null = null;
  if (raw.pieceWeightG !== "") {
    pw = parseDecimal(raw.pieceWeightG);
    if (!pw || new Decimal(pw).lte(0)) return { error: "Peso medio del pezzo non valido." };
  }
  if (dimensionOf(unit) === "volume") pw = null;
  return { name: raw.name, category: raw.category, supplier: raw.supplier, purchaseQty: qty, purchaseUnit: unit,
    price, yieldPct: y, pieceWeightG: pw, notes: raw.notes };
}

async function supplierId(name: string): Promise<number | null> {
  if (!name) return null;
  const s = await db.supplier.upsert({ where: { name }, update: {}, create: { name } });
  return s.id;
}

/** Food cost % dei piatti in carta, con i prezzi presenti ora nel database. */
async function menuPcts(): Promise<{ pcts: Map<number, Decimal>; target: string }> {
  const { engine, recipes, settings } = await loadAll();
  const pcts = new Map<number, Decimal>();
  for (const r of recipes) {
    if (r.type !== "PIATTO" || !r.onMenu) continue;
    const m = engine.dishMetrics(r.id);
    if (m) pcts.set(r.id, m.foodCostPct);
  }
  return { pcts, target: settings.targetFoodCostPct };
}

/**
 * Crea o aggiorna un ingrediente. Se cambiano le condizioni d'acquisto aggiunge
 * una riga allo storico e crea un avviso per ogni piatto che finisce sopra soglia.
 */
async function writeIngredient(id: number | null, d: IngredientData, before: Map<number, Decimal>) {
  const data = {
    name: d.name, category: d.category, supplierId: await supplierId(d.supplier), purchaseQty: d.purchaseQty,
    purchaseUnit: d.purchaseUnit, price: d.price, yieldPct: d.yieldPct, pieceWeightG: d.pieceWeightG, notes: d.notes,
  };
  const snapshot = { price: d.price, purchaseQty: d.purchaseQty, purchaseUnit: d.purchaseUnit };
  if (id == null) {
    const created = await db.ingredient.create({ data: { ...data, priceHistory: { create: snapshot } } });
    return { id: created.id, after: before, alerts: 0 };
  }
  const old = await db.ingredient.findUniqueOrThrow({ where: { id } });
  const priceChanged = old.price !== d.price || old.purchaseQty !== d.purchaseQty || old.purchaseUnit !== d.purchaseUnit;
  await db.ingredient.update({ where: { id }, data: { ...data, ...(priceChanged ? { priceHistory: { create: snapshot } } : {}) } });
  const costChanged = priceChanged || old.yieldPct !== d.yieldPct || old.pieceWeightG !== d.pieceWeightG;
  if (!costChanged) return { id, after: before, alerts: 0 };
  const { pcts: after, target } = await menuPcts();
  const over = newlyOverTarget(before, after, target);
  if (over.length) {
    await db.alert.createMany({
      data: over.map((o) => ({ ingredientId: id, recipeId: o.recipeId, oldPct: o.oldPct.toFixed(4), newPct: o.newPct.toFixed(4) })),
    });
  }
  return { id, after, alerts: over.length };
}

export async function saveIngredient(id: number | null, _: State, fd: FormData): Promise<State> {
  await requireUser();
  const v = validateIngredient({
    name: str(fd, "name"), category: str(fd, "category"), supplier: str(fd, "supplier"), purchaseQty: str(fd, "purchaseQty"),
    purchaseUnit: str(fd, "purchaseUnit"), price: str(fd, "price"), yieldPct: str(fd, "yieldPct"),
    pieceWeightG: str(fd, "pieceWeightG"), notes: str(fd, "notes"),
  });
  if ("error" in v) return v;
  const clash = await db.ingredient.findUnique({ where: { name: v.name } });
  if (clash && clash.id !== id) return { error: `Esiste già un ingrediente chiamato "${v.name}".` };
  if (id != null) {
    // Cambiare grandezza (es. da kg a litri) romperebbe le ricette che lo usano.
    const used = await db.recipeItem.findMany({ where: { ingredientId: id }, include: { recipe: true } });
    for (const u of used) {
      const ok = isUnit(u.unit) && (dimensionOf(u.unit) === dimensionOf(v.purchaseUnit) ||
        (v.pieceWeightG != null && dimensionOf(u.unit) !== "volume" && dimensionOf(v.purchaseUnit) !== "volume"));
      if (!ok) return { error: `Con queste unità la ricetta "${u.recipe.name}" non sarebbe più calcolabile (lo usa in ${u.unit}). Correggi prima la ricetta o indica il peso medio del pezzo.` };
    }
  }
  const { pcts } = await menuPcts();
  const res = await writeIngredient(id, v, pcts);
  revalidatePath("/", "layout");
  redirect(`/ingredienti/${res.id}?salvato=1`);
}

export async function deleteIngredient(id: number, _: State): Promise<State> {
  await requireUser();
  const used = await db.recipeItem.findMany({ where: { ingredientId: id }, include: { recipe: true } });
  if (used.length) {
    const names = [...new Set(used.map((u) => u.recipe.name))];
    return { error: `Non si può eliminare: è usato in ${names.join(", ")}.` };
  }
  await db.ingredient.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/ingredienti");
}

export async function importIngredients(_: State, fd: FormData): Promise<State> {
  await requireUser();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Scegli un file CSV o Excel." };
  if (file.size > 5_000_000) return { error: "File troppo grande (massimo 5 MB)." };
  let table: string[][];
  try {
    const name = file.name.toLowerCase();
    if (name.endsWith(".xlsx")) table = await parseXlsx(await file.arrayBuffer());
    else if (name.endsWith(".csv") || name.endsWith(".txt")) table = parseCsv(await file.text());
    else return { error: "Formato non supportato: usa un file .csv o .xlsx." };
  } catch {
    return { error: "Non riesco a leggere il file. Salvalo come .xlsx o .csv e riprova." };
  }
  const { rows, missing } = mapRows(table);
  if (missing.length) return { error: `Colonne mancanti: ${missing.join(", ")}. Scarica il modello e usa le stesse intestazioni.` };

  let { pcts } = await menuPcts();
  let created = 0, updated = 0, alerts = 0;
  const details: string[] = [];
  for (const [i, r] of rows.entries()) {
    const line = i + 2; // riga del file, contando l'intestazione
    if (!r.nome) continue;
    const existing = await db.ingredient.findFirst({ where: { name: r.nome }, include: { supplier: true } });
    // Sugli ingredienti già presenti i campi lasciati vuoti restano come sono.
    const v = validateIngredient({
      name: r.nome,
      category: r.categoria || existing?.category || "",
      supplier: r.fornitore || existing?.supplier?.name || "",
      purchaseQty: r.quantita,
      purchaseUnit: r.unita,
      price: r.prezzo,
      yieldPct: r.resa || existing?.yieldPct || "",
      pieceWeightG: r.pesoPezzo || existing?.pieceWeightG || "",
      notes: existing?.notes ?? "",
    });
    if ("error" in v) { details.push(`Riga ${line} (${r.nome}): ${v.error}`); continue; }
    try {
      const res = await writeIngredient(existing?.id ?? null, v, pcts);
      pcts = res.after;
      alerts += res.alerts;
      if (existing) updated++; else created++;
    } catch {
      details.push(`Riga ${line} (${r.nome}): non salvata.`);
    }
  }
  revalidatePath("/", "layout");
  const parts = [`${created} nuovi`, `${updated} aggiornati`];
  if (details.length) parts.push(`${details.length} righe scartate`);
  if (alerts) parts.push(`${alerts} piatti finiti sopra soglia (vedi la dashboard)`);
  return { ok: `Import completato: ${parts.join(", ")}.`, details };
}

// ──────────────────────── Semilavorati e piatti ────────────────────────

export type RecipePayload = {
  type: "SEMILAVORATO" | "PIATTO";
  name: string; category: string; notes: string;
  batchQty: string; batchUnit: string; pieceWeightG: string;
  portions: string; menuPrice: string; onMenu: boolean;
  items: { ref: string; quantity: string; unit: string }[];
};

export async function saveRecipe(id: number | null, _: State, fd: FormData): Promise<State> {
  await requireUser();
  let p: RecipePayload;
  try { p = JSON.parse(String(fd.get("payload"))); } catch { return { error: "Dati non validi." }; }
  const isDish = p.type === "PIATTO";
  if (p.type !== "PIATTO" && p.type !== "SEMILAVORATO") return { error: "Dati non validi." };
  const name = (p.name ?? "").trim();
  if (!name) return { error: "Manca il nome." };
  const clash = await db.recipe.findFirst({ where: { type: p.type, name } });
  if (clash && clash.id !== id) return { error: `Esiste già ${isDish ? "un piatto" : "un semilavorato"} chiamato "${name}".` };

  let batchQty: string | null = null, batchUnit: Unit | null = null, pieceWeightG: string | null = null;
  let portions: number | null = null, menuPrice: string | null = null;
  if (isDish) {
    portions = Number(p.portions);
    if (!Number.isInteger(portions) || portions < 1 || portions > 100) return { error: "Indica per quante persone basta il piatto (numero intero, almeno 1)." };
    menuPrice = parseDecimal(p.menuPrice);
    if (!menuPrice || new Decimal(menuPrice).lte(0)) return { error: "Inserisci il prezzo a menù (IVA inclusa)." };
  } else {
    batchQty = parseDecimal(p.batchQty);
    if (!batchQty || new Decimal(batchQty).lte(0)) return { error: "Inserisci la resa del lotto (quanto prodotto finito si ottiene)." };
    if (!isUnit(p.batchUnit)) return { error: "Unità della resa del lotto non valida." };
    batchUnit = p.batchUnit;
    if ((p.pieceWeightG ?? "").trim() !== "" && dimensionOf(batchUnit) !== "volume") {
      pieceWeightG = parseDecimal(p.pieceWeightG);
      if (!pieceWeightG || new Decimal(pieceWeightG).lte(0)) return { error: "Peso medio del pezzo non valido." };
    }
  }

  if (!Array.isArray(p.items) || p.items.length === 0) return { error: "Aggiungi almeno un ingrediente." };
  const items: { ingredientId: number | null; subRecipeId: number | null; quantity: string; unit: Unit }[] = [];
  for (const [i, it] of p.items.entries()) {
    const m = /^([ir])(\d+)$/.exec(it.ref ?? "");
    if (!m) return { error: `Riga ${i + 1}: scegli un ingrediente o un semilavorato.` };
    const quantity = parseDecimal(it.quantity);
    if (!quantity || new Decimal(quantity).lte(0)) return { error: `Riga ${i + 1}: quantità non valida.` };
    if (!isUnit(it.unit)) return { error: `Riga ${i + 1}: unità non valida.` };
    const refId = Number(m[2]);
    items.push({ ingredientId: m[1] === "i" ? refId : null, subRecipeId: m[1] === "r" ? refId : null, quantity, unit: it.unit });
  }

  const all = await loadAll();
  const subIds = items.flatMap((i) => (i.subRecipeId != null ? [i.subRecipeId] : []));
  for (const sid of subIds) {
    const sub = all.recipes.find((r) => r.id === sid);
    if (!sub || sub.type !== "SEMILAVORATO") return { error: "Uno dei semilavorati scelti non esiste più." };
  }
  if (id != null) {
    const graph = new Map(all.recInputs.map((r) => [r.id, r.items.flatMap((i) => (i.subRecipeId != null ? [i.subRecipeId] : []))]));
    if (wouldCreateCycle(id, subIds, graph)) {
      return { error: "Riferimento circolare: uno dei semilavorati scelti contiene già (anche indirettamente) questa ricetta." };
    }
  }

  // Prova il calcolo con la ricetta così com'è prima di salvarla (unità compatibili, ecc.).
  const draftId = id ?? -1;
  const draft: RecipeInput = { id: draftId, type: p.type, name, category: p.category ?? "", batchQty, batchUnit,
    pieceWeightG, portions, menuPrice, onMenu: !!p.onMenu, items };
  const trial = new Engine(all.ingInputs, [...all.recInputs.filter((r) => r.id !== draftId), draft], all.settings);
  const rc = trial.recipeCost(draftId);
  if (!rc.ok) return { error: `Non riesco a calcolare il costo: ${rc.error}.` };
  if (id != null && !isDish) {
    // Cambiando la resa del lotto, chi usa questo semilavorato deve restare calcolabile.
    for (const r of all.recInputs) {
      if (r.id === id || !r.items.some((i) => i.subRecipeId === id)) continue;
      const check = trial.recipeCost(r.id);
      if (!check.ok) return { error: `Con questa resa del lotto la ricetta "${r.name}" non sarebbe più calcolabile: ${check.error}.` };
    }
  }

  const data = { type: p.type, name, category: (p.category ?? "").trim(), notes: (p.notes ?? "").trim(), batchQty, batchUnit,
    pieceWeightG, portions, menuPrice, onMenu: isDish ? !!p.onMenu : true };
  const rows = items.map((it, position) => ({ ...it, position }));
  let savedId: number;
  if (id == null) {
    savedId = (await db.recipe.create({ data: { ...data, items: { create: rows } } })).id;
  } else {
    savedId = id;
    await db.$transaction([
      db.recipeItem.deleteMany({ where: { recipeId: id } }),
      db.recipe.update({ where: { id }, data: { ...data, items: { create: rows } } }),
    ]);
  }
  revalidatePath("/", "layout");
  redirect(`/${isDish ? "piatti" : "semilavorati"}/${savedId}?salvato=1`);
}

export async function deleteRecipe(id: number, _: State): Promise<State> {
  await requireUser();
  const recipe = await db.recipe.findUnique({ where: { id } });
  if (!recipe) return null;
  const used = await db.recipeItem.findMany({ where: { subRecipeId: id }, include: { recipe: true } });
  if (used.length) {
    const names = [...new Set(used.map((u) => u.recipe.name))];
    return { error: `Non si può eliminare: è usato in ${names.join(", ")}.` };
  }
  await db.recipe.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect(recipe.type === "PIATTO" ? "/piatti" : "/semilavorati");
}

export async function toggleOnMenu(id: number) {
  await requireUser();
  const r = await db.recipe.findUnique({ where: { id } });
  if (r) await db.recipe.update({ where: { id }, data: { onMenu: !r.onMenu } });
  revalidatePath("/", "layout");
}

export async function dismissAlert(id: number) {
  await requireUser();
  await db.alert.update({ where: { id }, data: { dismissed: true } });
  revalidatePath("/", "layout");
}
