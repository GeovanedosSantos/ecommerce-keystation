import type { Metadata } from "next";
import { AccountContent } from "./AccountContent";

export const metadata: Metadata = {
  title: "Minha Conta | KeyStation",
  description: "Gerencie seus dados de perfil, pedidos e segurança no KeyStation.",
};

export default function AccountPage() {
  return <AccountContent />;
}
