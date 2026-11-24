'use client'
import { useRef, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { MAX_SEARCH_LENGTH, parseCatalogQuery } from "@/core/modules/catalog/schema";
import { useCatalogQuery } from "../CatalogQueryContext";
import { HiddenQueryFields } from "../HiddenQueryFields";
import { useQueryText } from "../useQueryText";
import { CATALOG_PATH } from "../url";
import styles from "./CatalogSearch.module.css";

export function CatalogSearch() {
  const { query, update } = useCatalogQuery();
  const [text, setText] = useQueryText(query.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ q: parseCatalogQuery({ q: text }).q });
  }

  function clear() {
    setText("");
    inputRef.current?.focus();
    if (query.q) update({ q: undefined });
  }

  return (
    <form action={CATALOG_PATH} role="search" className={styles.form} onSubmit={handleSubmit}>
      <HiddenQueryFields query={query} omit={["q"]} />
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Buscar jogos, desenvolvedoras..."
        aria-label="Buscar jogos e desenvolvedoras"
        maxLength={MAX_SEARCH_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
        className={styles.input}
      />
      {text ? (
        <button type="button" className={styles.button} aria-label="Limpar busca" onClick={clear}>
          <X size={20} aria-hidden="true" />
        </button>
      ) : (
        <button type="submit" className={styles.button} aria-label="Buscar">
          <Search size={20} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
