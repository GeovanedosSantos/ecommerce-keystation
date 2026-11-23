'use client'
import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { parseCatalogQuery, TYPE_BY_CATEGORY, type CatalogQuery } from "@/core/modules/catalog/schema";
import { useCatalogQuery } from "../CatalogQueryContext";
import { HiddenQueryFields } from "../HiddenQueryFields";
import { TYPE_OPTIONS, type CatalogFilterOptions, type FilterOption } from "../options";
import { CATALOG_PATH } from "../url";
import { PriceRange } from "./PriceRange";
import styles from "./CatalogFilters.module.css";

/** Campos que este formulário envia; o resto da consulta (incluindo o preço) vai oculto. */
const FILTER_PARAMS = ["genre", "platform", "developer", "type", "sale"];

const FILTERS_BODY_ID = "catalog-filters-body";
const DEVELOPER_ID = "catalog-developer";

const NO_FILTERS = {
  genres: [],
  platforms: [],
  developers: [],
  categories: [],
  onSale: false,
  minPriceCents: undefined,
  maxPriceCents: undefined,
} satisfies Partial<CatalogQuery>;

/** A faixa de preço conta como um filtro. */
function countActiveFilters(query: CatalogQuery): number {
  const hasPriceRange = query.minPriceCents !== undefined || query.maxPriceCents !== undefined;
  return (
    query.genres.length +
    query.platforms.length +
    query.developers.length +
    query.categories.length +
    Number(query.onSale) +
    Number(hasPriceRange)
  );
}

const toggle = (values: string[], value: string, checked: boolean) =>
  checked ? [...values, value] : values.filter((item) => item !== value);

type CheckboxGroupProps = {
  legend: string;
  name: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

function CheckboxGroup({ legend, name, options, selected, onChange }: CheckboxGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => (
        <label key={option.slug} className={styles.checkbox}>
          <input
            type="checkbox"
            name={name}
            value={option.slug}
            checked={selected.includes(option.slug)}
            onChange={(event) => onChange(toggle(selected, option.slug, event.target.checked))}
          />
          {option.name}
        </label>
      ))}
    </fieldset>
  );
}

export function CatalogFilters({ options }: { options: CatalogFilterOptions }) {
  const { query, update } = useCatalogQuery();
  const [isOpen, setOpen] = useState(false);
  const activeCount = countActiveFilters(query);

  return (
    <form action={CATALOG_PATH} className={styles.panel} aria-label="Filtros">
      <HiddenQueryFields query={query} omit={FILTER_PARAMS} />

      <div className={styles.header}>
        {/* Título no desktop, botão de recolher no mobile. */}
        <h2 className={styles.title}>
          <Filter size={16} aria-hidden="true" /> Filtros
        </h2>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={FILTERS_BODY_ID}
          onClick={() => setOpen((open) => !open)}
        >
          <Filter size={16} aria-hidden="true" />
          Filtros{activeCount > 0 && ` (${activeCount})`}
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          />
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Limpar filtros"
            onClick={() => update(NO_FILTERS)}
          >
            Limpar
          </button>
        )}
      </div>

      <div id={FILTERS_BODY_ID} className={`${styles.body} ${isOpen ? "" : styles.bodyClosed}`}>
        <CheckboxGroup
          legend="Gênero"
          name="genre"
          options={options.genres}
          selected={query.genres}
          onChange={(genres) => update({ genres })}
        />

        <CheckboxGroup
          legend="Plataforma"
          name="platform"
          options={options.platforms}
          selected={query.platforms}
          onChange={(platforms) => update({ platforms })}
        />

        <CheckboxGroup
          legend="Tipo"
          name="type"
          options={TYPE_OPTIONS}
          selected={query.categories.map((category) => TYPE_BY_CATEGORY[category])}
          onChange={(types) => update({ categories: parseCatalogQuery({ type: types }).categories })}
        />

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Faixa de preço</legend>
          <PriceRange
            minPriceCents={query.minPriceCents}
            maxPriceCents={query.maxPriceCents}
            onCommit={(minPriceCents, maxPriceCents) => update({ minPriceCents, maxPriceCents })}
          />
        </fieldset>

        {options.developers.length > 0 && (
          <div className={styles.group}>
            <label htmlFor={DEVELOPER_ID} className={styles.legend}>
              Desenvolvedora
            </label>
            <div className={styles.selectWrapper}>
              <select
                id={DEVELOPER_ID}
                name="developer"
                className={styles.select}
                value={query.developers[0] ?? ""}
                onChange={(event) =>
                  update({ developers: event.target.value ? [event.target.value] : [] })
                }
              >
                <option value="">Todas</option>
                {options.developers.map((developer) => (
                  <option key={developer.slug} value={developer.slug}>
                    {developer.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectChevron} size={18} aria-hidden="true" />
            </div>
          </div>
        )}

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="sale"
            value="1"
            checked={query.onSale}
            onChange={(event) => update({ onSale: event.target.checked })}
          />
          Só jogos em oferta
        </label>

        {/* Sem JavaScript os filtros não aplicam sozinhos. */}
        <noscript>
          <Button type="submit" size="sm">
            Aplicar filtros
          </Button>
        </noscript>
      </div>
    </form>
  );
}
