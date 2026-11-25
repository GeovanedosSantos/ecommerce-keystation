import type { Metadata } from "next";
import { OverviewContent } from "./OverviewContent";

export const metadata: Metadata = {
  title: "Visão geral | Administração | KeyStation",
  description: "Painel administrativo de vendas e métricas da KeyStation.",
};

export default function AdminOverviewPage() {
  return <OverviewContent />;
}
