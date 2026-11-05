import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
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
      <Link href={`/products/${id}`} className={styles.imageWrapper}>
        <Image
          src={coverImage || "/globe.svg"}
          alt={title}
          fill
          className={styles.image}
        />
        {hasPromo && <span className={styles.discountBadge}>-{discount}%</span>}
        <span className={styles.categoryBadge}>{categoryName}</span>
      </Link>

      <div className={styles.content}>
        <span className={styles.developer}>{developer}</span>
        <Link href={`/products/${id}`} className={styles.title}>
          {title}
        </Link>

        <div className={styles.footer}>
          <Price value={hasPromo ? promotionalPrice : price} originalValue={hasPromo ? price : null} />

          <Button href={`/products/${id}`} size="icon" aria-label="Comprar">
            <ShoppingCart size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
