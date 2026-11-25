import { Suspense } from "react";
import type { Metadata } from "next";
import { listAdminProducts } from "@/core/modules/product/service";
import { GamesContent } from "./GamesContent";

export const metadata: Metadata = {
  title: "Jogos | Administração | KeyStation",
  description: "Cadastro e gerenciamento de jogos da KeyStation.",
};

async function GamesListLoader() {
  const products = await listAdminProducts();
  return <GamesContent products={products} />;
}

export default function AdminGamesPage() {
  return (
    <Suspense fallback={null}>
      <GamesListLoader />
    </Suspense>
  );
}
