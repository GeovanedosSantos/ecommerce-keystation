import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./CoverImage.module.css";

interface CoverImageProps {
  src?: string | null;
  alt: string;
  /**
   * card = 100% em 16:9, banner = 100% x 160px, thumb = 100 x 65px arredondado,
   * poster = 100% de largura em 3:4 (proporção das capas do IGDB, sem corte).
   */
  size?: "card" | "banner" | "thumb" | "poster";
  /**
   * Largura em que a imagem é exibida, para o Next escolher o arquivo certo
   * (ex: "(min-width: 1024px) 25vw, 100vw"). Sem ele, usa o padrão de cada tamanho.
   */
  sizes?: string;
  /** Quando informado, a capa inteira vira um link. */
  href?: string;
  /** Selos (`<CoverBadge>`) sobre a imagem. */
  children?: ReactNode;
}

const FALLBACK_SRC = "/globe.svg";

const DEFAULT_SIZES: Record<NonNullable<CoverImageProps["size"]>, string> = {
  card: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  poster: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  banner: "100vw",
  thumb: "100px",
};

/** Imagem de capa de jogo, com selos opcionais por cima. */
export function CoverImage({ src, alt, size = "card", sizes, href, children }: CoverImageProps) {
  const classes = `${styles.cover} ${styles[size]}`;
  const content = (
    <>
      <Image
        src={src || FALLBACK_SRC}
        alt={alt}
        fill
        sizes={sizes ?? DEFAULT_SIZES[size]}
        className={styles.image}
      />
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
