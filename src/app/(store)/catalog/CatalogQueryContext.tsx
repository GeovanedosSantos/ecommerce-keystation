'use client'
import { createContext, use, useCallback, useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CatalogQuery } from "@/core/modules/catalog/schema";
import { catalogUrl, withChanges } from "./url";

type CatalogQueryContextValue = {
  /** Já inclui a mudança que está carregando. */
  query: CatalogQuery;
  isPending: boolean;
  update: (changes: Partial<CatalogQuery>) => void;
};

const CatalogQueryContext = createContext<CatalogQueryContextValue | null>(null);

/** A URL é a única fonte do estado dos filtros. */
export function CatalogQueryProvider({ query, children }: { query: CatalogQuery; children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  const update = useCallback(
    (changes: Partial<CatalogQuery>) => {
      const next = withChanges(optimisticQuery, changes);
      startTransition(() => {
        setOptimisticQuery(next);
        router.push(catalogUrl(next), { scroll: false });
      });
    },
    [optimisticQuery, router, setOptimisticQuery],
  );

  return (
    <CatalogQueryContext value={{ query: optimisticQuery, isPending, update }}>
      {children}
    </CatalogQueryContext>
  );
}

export function useCatalogQuery(): CatalogQueryContextValue {
  const context = use(CatalogQueryContext);
  if (!context) throw new Error("useCatalogQuery precisa estar dentro de um CatalogQueryProvider");
  return context;
}
