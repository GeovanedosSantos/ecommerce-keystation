'use client'
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./PriceRange.module.css";

/** Em reais. O ponto da direita no máximo significa "sem limite" (R$ 300+). */
export const PRICE_RANGE_MAX = 300;
const STEP = 10;
/** Espera o usuário parar de arrastar antes de navegar. */
const COMMIT_DELAY_MS = 400;

type Range = [min: number, max: number];

type PriceRangeProps = {
  minPriceCents?: number;
  maxPriceCents?: number;
  onCommit: (minPriceCents: number | undefined, maxPriceCents: number | undefined) => void;
};

const clamp = (value: number) => Math.min(Math.max(value, 0), PRICE_RANGE_MAX);

function rangeFromQuery(minPriceCents?: number, maxPriceCents?: number): Range {
  const max = maxPriceCents === undefined ? PRICE_RANGE_MAX : clamp(Math.round(maxPriceCents / 100));
  const min = minPriceCents === undefined ? 0 : clamp(Math.round(minPriceCents / 100));
  return [Math.min(min, max), max];
}

const label = (value: number) => (value >= PRICE_RANGE_MAX ? `R$ ${PRICE_RANGE_MAX}+` : `R$ ${value}`);
const percent = (value: number) => `${(value / PRICE_RANGE_MAX) * 100}%`;

export function PriceRange({ minPriceCents, maxPriceCents, onCommit }: PriceRangeProps) {
  const fromQuery = rangeFromQuery(minPriceCents, maxPriceCents);
  const queryKey = fromQuery.join("-");
  const [range, setRange] = useState<Range>(fromQuery);
  const [lastQueryKey, setLastQueryKey] = useState(queryKey);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onCommitRef = useRef(onCommit);

  // A URL mudou por fora (Limpar, voltar do navegador): o slider acompanha.
  if (queryKey !== lastQueryKey) {
    setLastQueryKey(queryKey);
    setRange(fromQuery);
  }

  useEffect(() => {
    onCommitRef.current = onCommit;
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  function change(next: Range) {
    setRange(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const [min, max] = next;
      onCommitRef.current(min > 0 ? min * 100 : undefined, max < PRICE_RANGE_MAX ? max * 100 : undefined);
    }, COMMIT_DELAY_MS);
  }

  const [min, max] = range;
  const fill = { "--from": percent(min), "--to": percent(max) } as CSSProperties;

  return (
    <div className={styles.range}>
      <div className={styles.track} style={fill}>
        <input
          type="range"
          min={0}
          max={PRICE_RANGE_MAX}
          step={STEP}
          value={min}
          onChange={(event) => change([Math.min(Number(event.target.value), max), max])}
          aria-label="Preço mínimo"
          aria-valuetext={label(min)}
          // Com os dois pontos juntos à direita, o mínimo fica por cima para poder ser arrastado.
          className={`${styles.input} ${min > PRICE_RANGE_MAX / 2 ? styles.inputRaised : ""}`}
        />
        <input
          type="range"
          min={0}
          max={PRICE_RANGE_MAX}
          step={STEP}
          value={max}
          onChange={(event) => change([min, Math.max(Number(event.target.value), min)])}
          aria-label="Preço máximo"
          aria-valuetext={label(max)}
          className={styles.input}
        />
      </div>
      <div className={styles.values} aria-hidden="true">
        <span className={styles.value}>{label(min)}</span>
        <span className={styles.value}>{label(max)}</span>
      </div>
    </div>
  );
}
