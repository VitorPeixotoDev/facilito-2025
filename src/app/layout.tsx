import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthClientProvider } from "@/components/AuthClientProvider";
import { InstallPWA } from "@/components/InstallPWA";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facilitô! Vagas",
  description: "A plataforma de vagas mais fácil e intuitiva do mercado.",
  manifest: "/site.webmanifest",
  applicationName: "Facilitô! Vagas",
  appleWebApp: {
    capable: true,
    title: "Facilitô! Vagas",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/lito_head_init.png", type: "image/png" }],
    apple: [{ url: "/lito_head_init.png" }],
  },
  themeColor: "#5e9ea0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <InstallPWA />
        <AuthClientProvider
          key={user?.id ?? "signed-out"}
          initialUser={user}
        >
          {children}
        </AuthClientProvider>
      </body>
    </html>
  );
}
