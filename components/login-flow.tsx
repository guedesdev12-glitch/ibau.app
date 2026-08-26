"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, User, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

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

export function LoginFlow({
  login,
  loginWithGoogle,
  loginWithApple,
  initialError,
  initialMessage,
}: {
  login: (formData: FormData) => void;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  initialError?: string;
  initialMessage?: string;
}) {
  const [step, setStep] = useState<"welcome" | "email">("welcome");

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        {step === "email" && (
          <button
            onClick={() => setStep("welcome")}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="mb-8 text-center">
          <Image src="/logo-v2.png" alt="IBAU" width={96} height={96} className="mx-auto" priority />
        </div>

        {step === "welcome" ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-neutral-900">
                Bem-vindo(a) ao <span className="text-[#f0a922]">ibau</span>
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Conecte-se para viver o Reino, acompanhar eventos e muito mais.
              </p>
            </div>

            {initialError && (
              <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {initialError}
              </p>
            )}
            {initialMessage && (
              <p className="mb-4 rounded-xl bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
                {initialMessage}
              </p>
            )}

            <div className="space-y-2.5">
              <button
                onClick={() => setStep("email")}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#14532d] py-3 text-sm font-semibold text-white transition hover:bg-[#0f3f22]"
              >
                <Mail size={17} /> Entrar com e-mail
              </button>
              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  <GoogleIcon /> Entrar com Google
                </button>
              </form>
              <form action={loginWithApple}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  <AppleIcon /> Entrar com Apple
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-[#14532d]">
                Criar conta
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-neutral-900">Fazer login</h1>
              <p className="mt-1 text-sm text-neutral-500">Use suas credenciais para continuar</p>
            </div>

            {initialError && (
              <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {initialError}
              </p>
            )}

            <form action={login} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  E-mail
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Digite seu e-mail"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#14532d]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-600">Senha</label>
                  <Link href="/esqueci-senha" className="text-xs font-medium text-[#14532d]">
                    Esqueci minha senha
                  </Link>
                </div>
                <PasswordInput name="password" placeholder="Digite sua senha" required />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#14532d] py-3 text-sm font-semibold text-white transition hover:bg-[#0f3f22]"
              >
                Entrar
              </button>
            </form>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#14532d]/5 p-3.5">
              <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-[#14532d]" />
              <div>
                <p className="text-xs font-semibold text-neutral-800">Seus dados estão seguros</p>
                <p className="text-xs text-neutral-500">
                  Utilizamos criptografia e seguimos as melhores práticas para proteger suas
                  informações.
                </p>
              </div>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">ou continue com</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  <GoogleIcon /> Google
                </button>
              </form>
              <form action={loginWithApple}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  <AppleIcon /> Apple
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-[#14532d]">
                Criar conta
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
