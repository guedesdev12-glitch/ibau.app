import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { signup, loginWithOAuth } from "@/app/actions/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.6 35.1 26.9 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.7 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.2 5.5l6.5 5.5C39.5 37.1 44 31.1 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.462 2.15-1.19 2.98-.83.94-2.16 1.65-3.36 1.55-.14-1.11.44-2.28 1.16-3.05.83-.87 2.29-1.51 3.39-1.48zM20.9 17.24c-.51 1.14-.76 1.66-1.42 2.68-.92 1.42-2.22 3.19-3.83 3.2-1.44.02-1.81-.94-3.75-.93-1.94.01-2.34.95-3.79.93-1.61-.02-2.84-1.61-3.76-3.03-2.58-3.96-2.85-8.6-1.26-11.07 1.13-1.76 2.9-2.78 4.57-2.78 1.7 0 2.77.94 4.18.94 1.36 0 2.19-.94 4.18-.94 1.49 0 3.06.81 4.19 2.21-3.68 2.02-3.08 7.28.44 8.79z" />
    </svg>
  );
}

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const loginWithGoogle = loginWithOAuth.bind(null, "google", origin);
  const loginWithApple = loginWithOAuth.bind(null, "apple", origin);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d3a20] via-[#0a2c18] to-[#050f0a]" />
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#f0a922]/25 blur-[90px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#d5342e]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-[#1c5aa6]/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative w-full max-w-sm space-y-7">
        <div className="text-center">
          <Image src="/logo-v2.png" alt="IBAU" width={76} height={76} className="mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-white/60">Cadastre-se no IBAU App</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="space-y-2.5">
            <form action={loginWithGoogle}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                <GoogleIcon /> Continuar com Google
              </button>
            </form>
            <form action={loginWithApple}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-neutral-900"
              >
                <AppleIcon /> Continuar com Apple
              </button>
            </form>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">ou cadastre-se com e-mail</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <form action={signup} className="space-y-3">
            <input
              name="full_name"
              type="text"
              required
              placeholder="Nome completo"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="E-mail"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
            />
            <input
              name="password"
              type="password"
              minLength={6}
              required
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Criar conta
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-white underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
