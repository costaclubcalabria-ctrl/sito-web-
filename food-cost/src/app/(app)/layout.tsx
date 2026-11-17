import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { BottomNav, TopNav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
          <Link href="/" className="mr-2 text-base font-bold text-accent">Food cost</Link>
          <TopNav />
          <div className="ml-auto flex items-center gap-1">
            <Link href="/impostazioni" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink">Impostazioni</Link>
            <form action={logout}>
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink" title={`Esci (${user.name})`}>Esci</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
