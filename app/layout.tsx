import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cocotas - Deslize e Conecte",
  description: "O melhor lugar para conhecer novas pessoas.",
};

export const viewport: Viewport = {
  themeColor: "#111418",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ConditionalHeader from "@/components/ConditionalHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}
