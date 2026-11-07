import type { ReactNode } from "react";
import styles from "./PageContainer.module.css";

type Width = "xl" | "lg" | "md" | "sm";
type Padding = "md" | "lg" | "xl" | "2xl";
type Gap = "none" | "sm" | "md" | "lg";

interface PageContainerProps {
  /** Largura máxima: xl = 1280px, lg = 900px, md = 800px, sm = 480px. */
  width?: Width;
  /** Espaçamento vertical: md = 2rem, lg = 2.5rem, xl = 3rem, 2xl = 4rem. */
  paddingY?: Padding;
  /** Espaço entre os filhos: none = 0, sm = 1.5rem, md = 2rem, lg = 3rem. */
  gap?: Gap;
  className?: string;
  children: ReactNode;
}

const PADDING_CLASS: Record<Padding, string> = {
  md: styles.paddingMd,
  lg: styles.paddingLg,
  xl: styles.paddingXl,
  "2xl": styles.padding2xl,
};

const GAP_CLASS: Record<Gap, string> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

/** Wrapper centralizado de largura/padding das páginas. Não usa `<main>`: o layout já fornece. */
export function PageContainer({
  width = "xl",
  paddingY = "lg",
  gap = "md",
  className,
  children,
}: PageContainerProps) {
  const classes = [styles.container, styles[width], PADDING_CLASS[paddingY], GAP_CLASS[gap], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
