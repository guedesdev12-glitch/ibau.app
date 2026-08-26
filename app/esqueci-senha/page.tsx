import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const requestReset = requestPasswordReset.bind(null, origin);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="mb-6 text-center">
          <Image src="/logo-v2.png" alt="IBAU" width={80} height={80} className="mx-auto" priority />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mb-4 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-700">
            {message}
          </p>
        )}

        <form action={requestReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="Digite seu e-mail"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#14532d]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#14532d] py-3 text-sm font-semibold text-white transition hover:bg-[#0f3f22]"
          >
            Enviar link de redefinição
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-[#14532d]">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
