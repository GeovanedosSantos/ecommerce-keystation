import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogQuery } from "@/core/modules/catalog/schema";
import { catalogHref } from "../url";
import { paginationItems } from "./pagination";
import styles from "./Pagination.module.css";

type PaginationProps = { query: CatalogQuery; page: number; pageCount: number };

type StepProps = { href: string | null; label: string; rel: "prev" | "next"; children: ReactNode };

/** "Anterior" e "Próxima": nas pontas ficam desativados, sem link. */
function Step({ href, label, rel, children }: StepProps) {
  if (!href) {
    return (
      <span className={`${styles.action} ${styles.disabled}`} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} rel={rel} aria-label={label} className={styles.action}>
      {children}
    </Link>
  );
}

export function Pagination({ query, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;

  const hrefTo = (target: number) => catalogHref(query, { page: target });

  return (
    <nav aria-label="Paginação" className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <Step href={page > 1 ? hrefTo(page - 1) : null} label="Página anterior" rel="prev">
            <ChevronLeft size={18} aria-hidden="true" />
            <span className={styles.stepText}>Anterior</span>
          </Step>
        </li>

        {/* Só no mobile, no lugar dos números, que não cabem numa linha. */}
        <li className={styles.status}>
          Página {page} de {pageCount}
        </li>

        {paginationItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <li key={item} className={styles.number}>
              <Link
                href={hrefTo(item)}
                aria-label={`Página ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${styles.action} ${item === page ? styles.current : ""}`}
              >
                {item}
              </Link>
            </li>
          ) : (
            <li key={item} className={`${styles.number} ${styles.ellipsis}`} aria-hidden="true">
              …
            </li>
          ),
        )}

        <li>
          <Step href={page < pageCount ? hrefTo(page + 1) : null} label="Próxima página" rel="next">
            <span className={styles.stepText}>Próxima</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Step>
        </li>
      </ul>
    </nav>
  );
}
