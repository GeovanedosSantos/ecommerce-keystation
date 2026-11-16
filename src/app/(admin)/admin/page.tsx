import type { Metadata } from "next";
import { AdminContent } from "./AdminContent";

export const metadata: Metadata = {
  title: "Administração | KeyStation",
  description: "Painel administrativo de vendas, métricas e cadastro de jogos da KeyStation.",
};

export default function AdminPage() {
  return <AdminContent />;
}
