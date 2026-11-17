"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Dashboard", short: "Home" },
  { href: "/piatti", label: "Piatti", short: "Piatti" },
  { href: "/semilavorati", label: "Semilavorati", short: "Semilav." },
  { href: "/ingredienti", label: "Ingredienti", short: "Ingred." },
  { href: "/simulatore", label: "Tavolo tipo", short: "Tavolo" },
];

function useActive() {
  const path = usePathname();
  return (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
}

/** Tablet e computer: voci in alto. */
export function TopNav() {
  const active = useActive();
  return (
      <nav className="hidden gap-1 md:flex" aria-label="Sezioni">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${active(i.href) ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`}>
            {i.label}
          </Link>
        ))}
      </nav>
  );
}

/** Telefono: barra in basso, a portata di pollice. Va tenuta fuori dall'intestazione. */
export function BottomNav() {
  const active = useActive();
  return (
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Sezioni">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`flex min-h-14 items-center justify-center px-1 text-center text-xs font-semibold ${active(i.href) ? "text-accent" : "text-muted"}`}>
            <span className={`rounded-md px-2 py-1 ${active(i.href) ? "bg-accent-soft" : ""}`}>{i.short}</span>
          </Link>
        ))}
      </nav>
  );
}
