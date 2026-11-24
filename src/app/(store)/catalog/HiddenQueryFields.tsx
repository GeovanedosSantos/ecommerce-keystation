import { toCatalogSearchParams, type CatalogQuery } from "@/core/modules/catalog/schema";

/** Sem JavaScript, leva junto o resto da consulta ao enviar o formulário. A página fica de fora: volta para a 1. */
export function HiddenQueryFields({ query, omit }: { query: CatalogQuery; omit: string[] }) {
  const params = [...toCatalogSearchParams(query)].filter(
    ([name]) => name !== "page" && !omit.includes(name),
  );

  return params.map(([name, value]) => (
    <input key={`${name}=${value}`} type="hidden" name={name} value={value} />
  ));
}
