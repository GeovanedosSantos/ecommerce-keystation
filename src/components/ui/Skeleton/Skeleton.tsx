import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  /** Número = px; string = qualquer unidade CSS (ex.: "60%", "2rem"). Padrão: 100%. */
  width?: number | string;
  /** Número = px; string = qualquer unidade CSS. Padrão: 1rem. */
  height?: number | string;
  /** Raio da borda. Padrão: 6px. */
  radius?: number | string;
  className?: string;
}

/** Bloco cinza pulsante que ocupa o lugar de um conteúdo que ainda está carregando. */
export function Skeleton({ width = "100%", height = "1rem", radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };

  return <span className={[styles.skeleton, className].filter(Boolean).join(" ")} style={style} aria-hidden="true" />;
}
