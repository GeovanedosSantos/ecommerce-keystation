import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./CoverImage.module.css";

interface CoverImageProps {
  src?: string | null;
  alt: string;
  /** card = 100% x 180px, banner = 100% x 160px, thumb = 100 x 65px arredondado. */
  size?: "card" | "banner" | "thumb";
  /** Quando informado, a capa inteira vira um link. */
  href?: string;
  /** Selos (`<CoverBadge>`) sobre a imagem. */
  children?: ReactNode;
}

const FALLBACK_SRC = "/globe.svg";

/** Imagem de capa de jogo, com selos opcionais por cima. */
export function CoverImage({ src, alt, size = "card", href, children }: CoverImageProps) {
  const classes = `${styles.cover} ${styles[size]}`;
  const content = (
    <>
      <Image src={src || FALLBACK_SRC} alt={alt} fill className={styles.image} />
      {children}
    </>
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

interface CoverBadgeProps {
  /** primary = roxo sólido (ex.: desconto); glass = fundo escuro translúcido (ex.: categoria, plataforma). */
  tone?: "primary" | "glass";
  position?: "top-left" | "top-right" | "bottom-left";
  children: ReactNode;
}

const POSITION_CLASS = {
  "top-left": styles.topLeft,
  "top-right": styles.topRight,
  "bottom-left": styles.bottomLeft,
} as const;

export function CoverBadge({ tone = "glass", position = "top-left", children }: CoverBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]} ${POSITION_CLASS[position]}`}>{children}</span>;
}
