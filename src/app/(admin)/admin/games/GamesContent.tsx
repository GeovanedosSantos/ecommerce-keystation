"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
} from "lucide-react";
import type { AdminProductListItem } from "@/core/modules/product/types";
import { ProductStatus } from "@/generated/prisma/enums";
import { deleteAdminGameAction, toggleVariantStatusAction } from "./actions";
import styles from "../admin.module.css";

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function GamesContent({
  products,
}: {
  products: AdminProductListItem[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = products.filter((product) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      product.title.toLowerCase().includes(q) ||
      product.slug.toLowerCase().includes(q) ||
      (product.developer ?? "").toLowerCase().includes(q)
    );
  });

  function handleToggleStatus(
    slug: string,
    variantId: string,
    currentStatus: ProductStatus,
  ) {
    const nextStatus =
      currentStatus === ProductStatus.PUBLISHED
        ? ProductStatus.DISABLED
        : ProductStatus.PUBLISHED;

    startTransition(async () => {
      const res = await toggleVariantStatusAction(slug, variantId, nextStatus);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.message });
        return;
      }
      setFeedback({
        type: "success",
        message:
          nextStatus === ProductStatus.PUBLISHED
            ? "Jogo publicado no catálogo."
            : "Jogo desativado do catálogo.",
      });
      router.refresh();
    });
  }

  function handleDelete(slug: string, title: string) {
    if (!window.confirm(`Deseja excluir "${title}" do catálogo?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteAdminGameAction(slug);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.message });
        return;
      }
      setFeedback({
        type: "success",
        message: `"${title}" foi excluído com sucesso.`,
      });
      router.refresh();
    });
  }

  return (
    <div className={styles.contentArea}>
      {feedback && (
        <div
          className={
            feedback.type === "success"
              ? styles.notificationBanner
              : styles.errorBanner
          }
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTextGroup}>
          <span className={styles.sectionBadge}>CATÁLOGO / PRODUTOS</span>
          <h1 className={styles.sectionTitle}>Gerenciamento de Jogos</h1>
          <p className={styles.sectionSubtitle}>
            Cadastre novos títulos, edite informações, gerencie preços e aloque chaves no estoque.
          </p>
        </div>

        <Link href="/admin/games/new" className={styles.publishActionBtn}>
          <Plus size={16} />
          <span>Cadastrar jogo</span>
        </Link>
      </div>

      {/* Barra de Busca */}
      <div className={styles.toolbarRow}>
        <div className={styles.searchInputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, slug ou desenvolvedora..."
            className={styles.searchInput}
            aria-label="Buscar jogos"
          />
        </div>

        <span className={styles.filterNote}>
          {filteredProducts.length} de {products.length} jogos no catálogo
        </span>
      </div>

      {/* Tabela de Jogos */}
      <div className={styles.recentOrdersCard}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Gamepad2 size={36} />
            <p>
              {products.length === 0
                ? "Nenhum jogo cadastrado ainda."
                : "Nenhum jogo corresponde à busca informada."}
            </p>
            {products.length === 0 && (
              <Link href="/admin/games/new" className={styles.publishActionBtn}>
                <Plus size={16} />
                <span>Cadastrar primeiro jogo</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Plataforma</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const primaryVariant = product.variants[0];
                  const totalAvailable = product.variants.reduce(
                    (acc, v) => acc + v.availableKeys,
                    0,
                  );
                  const isPublished = product.variants.some(
                    (v) => v.status === ProductStatus.PUBLISHED,
                  );

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.gameCell}>
                          <Image
                            src={product.coverPath || "/globe.svg"}
                            alt={product.title}
                            width={56}
                            height={36}
                            unoptimized
                            className={styles.gameThumb}
                          />
                          <div className={styles.gameCellInfo}>
                            <Link
                              href={`/admin/games/${product.slug}/edit`}
                              className={styles.gameTitleLink}
                            >
                              {product.title}
                            </Link>
                            <span className={styles.gameMetaSub}>
                              {product.developer || "KeyStation"} ·{" "}
                              {product.genres.map((g) => g.name).join(", ") ||
                                product.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {product.variants.length > 0
                          ? product.variants.map((v) => v.platformName).join(", ")
                          : "Sem plataforma"}
                      </td>

                      <td>
                        {primaryVariant
                          ? formatPrice(primaryVariant.price)
                          : "—"}
                      </td>

                      <td>
                        {totalAvailable}{" "}
                        {totalAvailable === 1 ? "chave" : "chaves"}
                      </td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            isPublished
                              ? styles.statusApproved
                              : styles.statusPending
                          }`}
                        >
                          {isPublished ? "Publicado" : "Rascunho"}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actionGroup}>
                          <Link
                            href={`/admin/games/${product.slug}/edit`}
                            className={styles.iconActionBtn}
                          >
                            <Pencil size={14} />
                            <span>Editar</span>
                          </Link>

                          {primaryVariant && (
                            <button
                              type="button"
                              className={styles.iconActionBtn}
                              disabled={isPending}
                              onClick={() =>
                                handleToggleStatus(
                                  product.slug,
                                  primaryVariant.id,
                                  primaryVariant.status,
                                )
                              }
                              title={
                                primaryVariant.status === ProductStatus.PUBLISHED
                                  ? "Ocultar do catálogo"
                                  : "Publicar no catálogo"
                              }
                            >
                              {primaryVariant.status === ProductStatus.PUBLISHED ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            className={styles.dangerActionBtn}
                            disabled={isPending}
                            onClick={() =>
                              handleDelete(product.slug, product.title)
                            }
                            aria-label={`Excluir ${product.title}`}
                            title="Excluir jogo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
