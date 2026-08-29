import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = [
  "/login",
  "/cadastro",
  "/auth",
  "/esqueci-senha",
  "/redefinir-senha",
];

const ONBOARDING_PATH = "/completar-cadastro";

/** Tempo máximo de inatividade antes de encerrar a sessão. */
const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas
const ACTIVITY_COOKIE = "ibau-last-activity";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isOnboarding = pathname.startsWith(ONBOARDING_PATH);

  if (!user && !isPublicPath && !isOnboarding) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // ---- Expiração por inatividade ----
    if (!isPublicPath) {
      const lastRaw = request.cookies.get(ACTIVITY_COOKIE)?.value;
      const last = lastRaw ? Number(lastRaw) : null;
      const now = Date.now();

      if (last && Number.isFinite(last) && now - last > INACTIVITY_LIMIT_MS) {
        await supabase.auth.signOut();

        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "?message=Sua sessão expirou por inatividade. Entre novamente.";
        const redirectResponse = NextResponse.redirect(url);

        // Limpa cookies de sessão e o marcador de atividade
        for (const cookie of request.cookies.getAll()) {
          if (cookie.name.startsWith("sb-") || cookie.name === ACTIVITY_COOKIE) {
            redirectResponse.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
          }
        }
        return redirectResponse;
      }

      // Renova o marcador a cada requisição autenticada
      supabaseResponse.cookies.set(ACTIVITY_COOKIE, String(now), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: INACTIVITY_LIMIT_MS / 1000,
      });
    }

    // ---- Cadastro obrigatório ----
    if (!isOnboarding && !isPublicPath) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = ONBOARDING_PATH;
        const r = NextResponse.redirect(url);
        r.cookies.set(ACTIVITY_COOKIE, String(Date.now()), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: INACTIVITY_LIMIT_MS / 1000,
        });
        return r;
      }
    }

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
