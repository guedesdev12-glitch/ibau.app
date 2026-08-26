import Image from "next/image";
import { updatePassword } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image src="/logo-v2.png" alt="IBAU" width={80} height={80} className="mx-auto" priority />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Redefinir senha</h1>
          <p className="mt-1 text-sm text-neutral-500">Escolha uma nova senha para sua conta.</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <form action={updatePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Nova senha
            </label>
            <PasswordInput name="password" placeholder="Mín. 6 caracteres" minLength={6} required />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#14532d] py-3 text-sm font-semibold text-white transition hover:bg-[#0f3f22]"
          >
            Salvar nova senha
          </button>
        </form>
      </div>
    </main>
  );
}
