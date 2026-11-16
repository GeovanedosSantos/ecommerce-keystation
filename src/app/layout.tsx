import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Keystation | Chaves Digitais de Jogos",
  description: "Sua plataforma confiável de chaves digitais para jogos de PC com entrega instantânea e segurança garantida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
