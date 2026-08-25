import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBAU App",
  description: "Aplicativo da igreja IBAU — membros, células, loja, bilheteria e finanças.",
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
