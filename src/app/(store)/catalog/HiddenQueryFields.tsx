import { toCatalogSearchParams, type CatalogQuery } from "@/core/modules/catalog/schema";

/** Sem JavaScript, leva junto o resto da consulta ao enviar o formulário. */
export function HiddenQueryFields({ query, omit }: { query: CatalogQuery; omit: string[] }) {
  const params = [...toCatalogSearchParams({ ...query, page: 1 })].filter(([name]) => !omit.includes(name));

  return params.map(([name, value]) => (
    <input key={`${name}=${value}`} type="hidden" name={name} value={value} />
  ));
}
