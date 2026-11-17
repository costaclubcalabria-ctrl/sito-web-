import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { db } from "@/lib/db";
import { deleteUser } from "@/lib/actions";
import { inputValue } from "@/lib/format";
import { PageHead } from "@/components/bits";
import { DeleteButton } from "@/components/ui";
import { AddUserForm, PasswordForm, SettingsForm } from "./Forms";

export const dynamic = "force-dynamic";

export default async function Impostazioni() {
  const me = await requireUser();
  const s = await getSettings();
  const users = await db.user.findMany({ orderBy: { username: "asc" } });
  return (
    <>
      <PageHead title="Impostazioni" />
      <div className="space-y-5">
        <section className="card">
          <h2 className="h2 mb-3">Soglie</h2>
          <SettingsForm values={{ targetFoodCostPct: inputValue(s.targetFoodCostPct), vatPct: inputValue(s.vatPct), targetReceipt: inputValue(s.targetReceipt) }} />
        </section>
        <section className="card">
          <h2 className="h2 mb-3">Account</h2>
          <ul className="mb-4 divide-y divide-line">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="mr-auto"><strong>{u.name}</strong> <span className="text-muted">({u.username}){u.id === me.id && " · tu"}</span></span>
                {u.id !== me.id && <DeleteButton action={deleteUser.bind(null, u.id)} label="Rimuovi" confirmText={`Rimuovere l'account di ${u.name}?`} />}
              </li>
            ))}
          </ul>
          <AddUserForm />
          <hr className="my-4 border-line" />
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
