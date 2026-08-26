import { headers } from "next/headers";
import { login, loginWithOAuth } from "@/app/actions/auth";
import { LoginFlow } from "@/components/login-flow";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const loginWithGoogle = loginWithOAuth.bind(null, "google", origin);
  const loginWithApple = loginWithOAuth.bind(null, "apple", origin);

  return (
    <LoginFlow
      login={login}
      loginWithGoogle={loginWithGoogle}
      loginWithApple={loginWithApple}
      initialError={error}
      initialMessage={message}
    />
  );
}
