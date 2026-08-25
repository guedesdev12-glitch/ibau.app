import { createClient } from "@/lib/supabase/server";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  lider_celula: "Líder de célula",
  membro: "Membro",
};

export default async function MembrosPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .order("full_name");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Membros</h1>
      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        {members?.map((member) => (
          <li key={member.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{member.full_name}</p>
              <p className="text-neutral-500">{member.phone ?? "Sem telefone cadastrado"}</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
              {ROLE_LABEL[member.role]}
            </span>
          </li>
        ))}
        {members?.length === 0 && (
          <li className="px-4 py-3 text-sm text-neutral-500">Nenhum membro cadastrado.</li>
        )}
      </ul>
    </main>
  );
}
