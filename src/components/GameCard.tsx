import Link from "next/link";
import { Price } from "@/components/ui/Price/Price";
import { CoverImage, CoverBadge } from "@/components/ui/CoverImage/CoverImage";
import { AddToCartButton } from "@/components/AddToCartButton";
import styles from "./GameCard.module.css";

interface GameCardProps {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  promotionalPrice?: number | null;
  developer: string;
  categoryName: string;
}

export function GameCard({
  id,
  title,
  slug,
  coverImage,
  price,
  promotionalPrice,
  developer,
  categoryName,
}: GameCardProps) {
  const hasPromo = promotionalPrice && promotionalPrice < price;
  const discount = hasPromo ? Math.round(((price - promotionalPrice) / price) * 100) : 0;

  return (
    <div className={styles.card}>
      <CoverImage src={coverImage} alt={title} href={`/products/${id}`}>
        {hasPromo && <CoverBadge tone="primary">-{discount}%</CoverBadge>}
        <CoverBadge position="bottom-left">{categoryName}</CoverBadge>
      </CoverImage>

      <div className={styles.content}>
        <span className={styles.developer}>{developer}</span>
        <Link href={`/products/${id}`} className={styles.title}>
          {title}
        </Link>

        <div className={styles.footer}>
          <Price value={hasPromo ? promotionalPrice : price} originalValue={hasPromo ? price : null} />

          <AddToCartButton productId={id} title={title} />
        </div>
      </div>
    </div>
  );
}