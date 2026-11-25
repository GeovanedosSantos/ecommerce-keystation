import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundError } from "@/core/errors";
import {
  getAdminProductBySlug,
  listCatalogOptions,
} from "@/core/modules/product/service";
import { GameForm } from "../../GameForm";

export const metadata: Metadata = {
  title: "Editar Jogo | Administração | KeyStation",
  description: "Edite informações, imagens, preço e estoque de chaves do jogo.",
};

async function EditGameLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: Awaited<
    ReturnType<
      typeof Promise.all<[ReturnType<typeof getAdminProductBySlug>, ReturnType<typeof listCatalogOptions>]>
    >
  >;

  try {
    data = await Promise.all([
      getAdminProductBySlug(slug),
      listCatalogOptions(),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const [product, options] = data;
  return <GameForm mode="edit" options={options} initialProduct={product} />;
}

export default function AdminEditGamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <EditGameLoader params={params} />
    </Suspense>
  );
}
