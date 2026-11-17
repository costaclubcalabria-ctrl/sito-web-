import Decimal from "decimal.js";
import { pct } from "@/lib/format";

export function FcBadge({ value, target }: { value: Decimal | null; target: string }) {
  if (!value) return <span className="badge bg-warn-soft text-warn">da completare</span>;
  const over = value.gt(target);
  return (
    <span className={`badge num ${over ? "bg-over-soft text-over" : "bg-accent-soft text-accent"}`}>
      {pct(value)}{over && <span className="sr-only"> sopra soglia</span>}
    </span>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "over" | "ok" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "over" ? "border-over/30 bg-over-soft" : "border-line bg-card"}`}>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={`num mt-0.5 text-xl font-bold ${tone === "over" ? "text-over" : tone === "ok" ? "text-accent" : ""}`}>{value}</div>
      {sub && <div className="num mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <h1 className="h1 mr-auto">{title}</h1>
      {children}
    </div>
  );
}

export function Saved({ show }: { show: boolean }) {
  return show ? <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent">Salvato.</p> : null;
}
