import Link from "next/link";
import { Price } from "@/components/ui/Price/Price";
import { CoverImage, CoverBadge } from "@/components/ui/CoverImage/CoverImage";
import { AddToCartButton } from "@/components/AddToCartButton";
import styles from "./GameCard.module.css";

interface GameCardProps {
  id: string;
  variantId?: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  promotionalPrice?: number | null;
  /** Percentual da promoção. Sem ele (dados mock), é calculado a partir dos preços. */
  discountPercent?: number | null;
  developer: string;
  platform: string;
  /** Abre a página do produto já nesta plataforma (`?platform=`). */
  platformSlug?: string;
}

export function GameCard({
  variantId,
  title,
  slug,
  coverImage,
  price,
  promotionalPrice,
  discountPercent,
  developer,
  platform,
  platformSlug,
}: GameCardProps) {
  const hasPromo = promotionalPrice && promotionalPrice < price;
  const discount = hasPromo
    ? (discountPercent ?? Math.round(((price - promotionalPrice) / price) * 100))
    : 0;
  const href = platformSlug ? `/products/${slug}?platform=${platformSlug}` : `/products/${slug}`;

  return (
    <div className={styles.card}>
      <CoverImage src={coverImage} alt={title} href={href}>
        {hasPromo && <CoverBadge tone="primary">-{discount}%</CoverBadge>}
        <CoverBadge position="bottom-left">{platform}</CoverBadge>
      </CoverImage>

      <div className={styles.content}>
        <span className={styles.developer}>{developer}</span>
        <Link href={href} className={styles.title}>
          {title}
        </Link>

        <div className={styles.footer}>
          <Price value={hasPromo ? promotionalPrice : price} originalValue={hasPromo ? price : null} />

          <AddToCartButton variantId={variantId} title={title} />
        </div>
      </div>
    </div>
  );
}