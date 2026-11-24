import { GameCard } from "@/components/GameCard";
import type { EditionView } from "../types";
import styles from "./OtherEditions.module.css";

interface OtherEditionsProps {
  editions: EditionView[];
  /** Cada edição mostra o preço nesta plataforma, ou na primeira que tiver. */
  platformId: string;
}

export function OtherEditions({ editions, platformId }: OtherEditionsProps) {
  if (editions.length === 0) return null;

  return (
    <section className={styles.editions} aria-labelledby="outras-edicoes">
      <h2 id="outras-edicoes" className={styles.title}>
        Outras Edições
      </h2>

      <ul className={styles.list}>
        {editions.map((edition) => {
          // `withAvailability` só mantém edições com pelo menos uma variant publicada.
          const variant =
            edition.variants.find(({ platform }) => platform.id === platformId) ??
            edition.variants[0];

          return (
            <li key={edition.id} className={styles.item}>
              <GameCard
                id={edition.id}
                title={edition.title}
                slug={edition.slug}
                coverImage={edition.coverPath ?? ""}
                price={variant.price}
                promotionalPrice={variant.promotionalPrice}
                discountPercent={variant.discountPercent}
                developer={edition.developer ?? ""}
                platform={variant.platform.name}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
