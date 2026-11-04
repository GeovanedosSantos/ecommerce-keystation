import styles from "./Price.module.css";

interface PriceProps {
  /** Preço a pagar. */
  value: number;
  /** Preço cheio; só é exibido (riscado) quando maior que `value`. */
  originalValue?: number | null;
  size?: "sm" | "md" | "lg";
}

function formatBRL(amount: number) {
  return `R$ ${amount.toFixed(2)}`;
}

export function Price({ value, originalValue, size = "sm" }: PriceProps) {
  const showOriginal = originalValue != null && originalValue > value;

  return (
    <div className={`${styles.price} ${styles[size]}`}>
      {showOriginal && <span className={styles.original}>{formatBRL(originalValue)}</span>}
      <span className={styles.current}>{formatBRL(value)}</span>
    </div>
  );
}
