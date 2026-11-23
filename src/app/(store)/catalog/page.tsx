import { Suspense } from "react";
import { GameCard } from "@/components/GameCard";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { parseCatalogQuery, type SearchParamsInput } from "@/core/modules/catalog/schema";
import { GAMES } from "@/utils/mock/games";
import { CatalogFilters } from "./CatalogFilters/CatalogFilters";
import { CatalogQueryProvider } from "./CatalogQueryContext";
import { CatalogSearch } from "./CatalogSearch/CatalogSearch";
import { STATIC_FILTER_OPTIONS } from "./options";
import { SortSelect } from "./SortSelect/SortSelect";
import styles from "./catalog.module.css";

type CatalogPageProps = { searchParams: Promise<SearchParamsInput> };

async function Catalog({ searchParams }: CatalogPageProps) {
  const query = parseCatalogQuery(await searchParams);

  return (
    <CatalogQueryProvider query={query}>
      <div className={styles.toolbar}>
        <CatalogSearch />
        <SortSelect />
      </div>

      <div className={styles.layout}>
        <CatalogFilters options={STATIC_FILTER_OPTIONS} />

        <div className={styles.gridContainer}>
          {/* TODO(Parte 2): trocar o mock pelo searchCatalog. */}
          <div className={styles.grid}>
            {GAMES.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
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
