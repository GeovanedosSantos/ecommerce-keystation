import { Suspense } from "react";
import type { Metadata } from "next";
import { listCatalogOptions } from "@/core/modules/product/service";
import { GameForm } from "../GameForm";

export const metadata: Metadata = {
  title: "Novo Jogo | Administração | KeyStation",
  description: "Cadastre um novo jogo e aloque chaves no catálogo KeyStation.",
};

async function NewGameLoader() {
  const options = await listCatalogOptions();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <GameForm mode="create" options={options} defaultReleaseDate={today} />
  );
}

export default function AdminNewGamePage() {
  return (
    <Suspense fallback={null}>
      <NewGameLoader />
    </Suspense>
  );
}
