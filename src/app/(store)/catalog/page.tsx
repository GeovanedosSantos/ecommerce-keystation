import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { GameCard } from "@/components/GameCard";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import {
  parseCatalogQuery,
  type CatalogQuery,
  type SearchParamsInput,
} from "@/core/modules/catalog/schema";
import { searchCatalog } from "@/core/modules/catalog/service";
import { getCartVariantIds } from "@/core/modules/cart/cart.service";
import { getSession } from "@/infra/session-cookie";
import { CatalogFilters } from "./CatalogFilters/CatalogFilters";
import { CatalogQueryProvider } from "./CatalogQueryContext";
import { CatalogSearch } from "./CatalogSearch/CatalogSearch";
import { getCatalogFacetsCached } from "./data";
import { toGameCard, toResultsLabel } from "./mapper";
import { Pagination } from "./Pagination/Pagination";
import { catalogHref } from "./url";
import { SortSelect } from "./SortSelect/SortSelect";
import styles from "./catalog.module.css";

type CatalogPageProps = { searchParams: Promise<SearchParamsInput> };

/** Visitante sem login não tem carrinho. */
async function getCartVariantIdsOfSession(): Promise<Set<string>> {
  const session = await getSession();
  return new Set(session ? await getCartVariantIds(session.userId) : []);
}

/** Preço, promoção e carrinho mudam a cada acesso: a listagem não vai para o cache. */
async function CatalogResults({ query }: { query: CatalogQuery }) {
  await connection();
  const [result, cartVariantIds] = await Promise.all([
    searchCatalog(query),
    getCartVariantIdsOfSession(),
  ]);

  // Link antigo ou ?page= editado à mão: leva para a última página que existe.
  if (result.page > result.pageCount && result.pageCount > 0) {
    redirect(catalogHref(query, { page: result.pageCount }));
  }

  if (result.items.length === 0) {
    return (
      <p className={styles.empty} role="status">
        Produto não encontrado
      </p>
    );
  }

  return (
    <>
      {/* role="status": o leitor de tela anuncia o novo total quando os filtros mudam. */}
      <p className={styles.count} role="status">
        {toResultsLabel(result)}
      </p>
      <div className={styles.grid}>
        {result.items.map((item) => (
          <GameCard key={item.variantId} {...toGameCard(item, cartVariantIds.has(item.variantId))} />
        ))}
      </div>
      <Pagination query={query} page={result.page} pageCount={result.pageCount} />
    </>
  );
}

async function Catalog({ searchParams }: CatalogPageProps) {
  const [query, facets] = await Promise.all([
    searchParams.then(parseCatalogQuery),
    getCatalogFacetsCached(),
  ]);

  return (
    <CatalogQueryProvider query={query}>
      <div className={styles.toolbar}>
        <CatalogSearch />
        <SortSelect />
      </div>

      <div className={styles.layout}>
        <CatalogFilters options={facets} />

        <div className={styles.gridContainer}>
          <Suspense>
            <CatalogResults query={query} />
          </Suspense>
        </div>
      </div>
    </CatalogQueryProvider>
  );
}

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  return (
    <PageContainer paddingY="md">
      <h1 className={styles.title}>Catálogo</h1>
      <Suspense>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
