import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  const firstRun = (await db.user.count()) === 0;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="h1 text-accent">Food cost</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Costi, margini e prezzi dei piatti.</p>
      <div className="card">
        <LoginForm firstRun={firstRun} />
      </div>
    </main>
  );
}
