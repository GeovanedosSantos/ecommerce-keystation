'use client'
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { CATALOG_SORTS, parseCatalogQuery } from "@/core/modules/catalog/schema";
import { useCatalogQuery } from "../CatalogQueryContext";
import { HiddenQueryFields } from "../HiddenQueryFields";
import { SORT_LABEL } from "../options";
import { CATALOG_PATH } from "../url";
import styles from "./SortSelect.module.css";

const SORT_ID = "catalog-sort";

export function SortSelect() {
  const { query, update } = useCatalogQuery();

  return (
    <form action={CATALOG_PATH} className={styles.wrapper}>
      <HiddenQueryFields query={query} omit={["sort"]} />
      <label htmlFor={SORT_ID} className={styles.visuallyHidden}>
        Ordenar por
      </label>
      <SlidersHorizontal className={styles.icon} size={18} aria-hidden="true" />
      <select
        id={SORT_ID}
        name="sort"
        className={styles.select}
        value={query.sort}
        onChange={(event) => update({ sort: parseCatalogQuery({ sort: event.target.value }).sort })}
      >
        {CATALOG_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABEL[sort]}
          </option>
        ))}
      </select>
      <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
      {/* Sem JavaScript o select não envia sozinho. */}
      <noscript>
        <Button type="submit" size="sm" inline>
          Ordenar
        </Button>
      </noscript>
    </form>
  );
}
