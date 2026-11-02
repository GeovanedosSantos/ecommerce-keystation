import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider } from "@/components/sidebar/SidebarProvider";
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
      <body>
        <SidebarProvider header={<Header />}>
          <main>{children}</main>
          <Footer />
        </SidebarProvider>
      </body>
    </html>
  );
}
