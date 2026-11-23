'use client'
import { useState, type FormEvent } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { parseCatalogQuery, TYPE_BY_CATEGORY, type CatalogQuery } from "@/core/modules/catalog/schema";
import { useCatalogQuery } from "../CatalogQueryContext";
import { HiddenQueryFields } from "../HiddenQueryFields";
import { TYPE_OPTIONS, type CatalogFilterOptions, type FilterOption } from "../options";
import { useQueryText } from "../useQueryText";
import { CATALOG_PATH } from "../url";
import styles from "./CatalogFilters.module.css";

const FILTER_PARAMS = ["genre", "platform", "developer", "type", "sale", "min", "max"];

const centsToText = (cents: number | undefined) => (cents === undefined ? "" : String(cents / 100));

const FILTERS_BODY_ID = "catalog-filters-body";

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

/** O preço só aplica no Enter ou no "Aplicar", para não navegar a cada dígito. */
export function CatalogFilters({ options }: { options: CatalogFilterOptions }) {
  const { query, update } = useCatalogQuery();
  const [min, setMin] = useQueryText(centsToText(query.minPriceCents));
  const [max, setMax] = useQueryText(centsToText(query.maxPriceCents));
  const [isOpen, setOpen] = useState(false);
  const activeCount = countActiveFilters(query);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { minPriceCents, maxPriceCents } = parseCatalogQuery({ min, max });
    update({ minPriceCents, maxPriceCents });
  }

  return (
    <form action={CATALOG_PATH} className={styles.panel} aria-label="Filtros" onSubmit={handleSubmit}>
      <HiddenQueryFields query={query} omit={FILTER_PARAMS} />

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

        <CheckboxGroup
          legend="Desenvolvedora"
          name="developer"
          options={options.developers}
          selected={query.developers}
          onChange={(developers) => update({ developers })}
        />

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Oferta</legend>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="sale"
              value="1"
              checked={query.onSale}
              onChange={(event) => update({ onSale: event.target.checked })}
            />
            Somente em oferta
          </label>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Faixa de preço (R$)</legend>
          <div className={styles.price}>
            <input
              type="number"
              name="min"
              min={0}
              step={0.01}
              inputMode="decimal"
              placeholder="Mín."
              aria-label="Preço mínimo"
              value={min}
              onChange={(event) => setMin(event.target.value)}
            />
            <span aria-hidden="true">até</span>
            <input
              type="number"
              name="max"
              min={0}
              step={0.01}
              inputMode="decimal"
              placeholder="Máx."
              aria-label="Preço máximo"
              value={max}
              onChange={(event) => setMax(event.target.value)}
            />
          </div>
          <Button type="submit" size="sm">
            Aplicar
          </Button>
        </fieldset>
      </div>
    </form>
  );
}
