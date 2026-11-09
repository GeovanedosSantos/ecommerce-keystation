"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check, Eye } from "lucide-react";
import { CoverImage, CoverBadge } from "@/components/ui/CoverImage/CoverImage";
import type { VaultKey } from "@/utils/mock/vault";
import styles from "./vault.module.css";

export function VaultKeyCard({ item }: { item: VaultKey }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div className={styles.vaultCard}>
      <CoverImage src={item.coverImage} alt={item.gameTitle} size="banner">
        <CoverBadge position="top-right">{item.platform}</CoverBadge>
      </CoverImage>

      <div className={styles.content}>
        <h3>{item.gameTitle}</h3>
        <span className={styles.date}>Comprado em: {item.purchaseDate}</span>

        <div className={styles.keyBox}>
          <div className={styles.keyText}>
            <span>{isRevealed ? item.key : "•••••-•••••-•••••"}</span>
          </div>

          {!isRevealed ? (
            <button
              type="button"
              className={styles.revealBtn}
              onClick={() => setIsRevealed(true)}
              aria-label={`Revelar chave de ${item.gameTitle}`}
            >
              <Eye size={14} />
              <span>Revelar Chave</span>
            </button>
          ) : copied ? (
            <span className={styles.copiedBadge} role="status">
              <Check size={14} />
              <span>Copiado!</span>
            </span>
          ) : (
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label={`Copiar chave de ${item.gameTitle}`}
            >
              <Copy size={14} />
              <span>Copiar</span>
            </button>
          )}
        </div>

        <div className={styles.guideLink}>
          <ShieldCheck size={16} className={styles.successIcon} />
          <a href="/help/steam-guide" target="_blank" rel="noopener noreferrer">
            Como ativar na Steam &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
