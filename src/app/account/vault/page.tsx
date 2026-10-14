import Image from "next/image";
import { KeyRound, ShieldCheck, ExternalLink, Copy } from "lucide-react";
import styles from "./vault.module.css";

const VAULT_KEYS = [
  {
    id: "v1",
    gameTitle: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    platform: "Steam (PC)",
    key: "X9K2P-M8N3Q-W4R7T",
    purchaseDate: "12/10/2026",
  },
  {
    id: "v2",
    gameTitle: "Elden Ring: Shadow of the Erdtree",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    platform: "Steam (PC)",
    key: "ELND-77891-BGT42",
    purchaseDate: "12/10/2026",
  },
];

export default function VaultPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <KeyRound size={28} /> Meu Cofre (Minhas Chaves)
        </h1>
        <p>Aqui estão todas as suas chaves digitais adquiridas. Clique em &quot;Revelar Chave&quot; para visualizar e copiar.</p>
      </div>

      <div className={styles.grid}>
        {VAULT_KEYS.map((item) => (
          <div key={item.id} className={styles.vaultCard}>
            <div className={styles.imageWrapper}>
              <Image src={item.coverImage} alt={item.gameTitle} fill className={styles.image} />
              <span className={styles.platformBadge}>{item.platform}</span>
            </div>

            <div className={styles.content}>
              <h3>{item.gameTitle}</h3>
              <span className={styles.date}>Comprado em: {item.purchaseDate}</span>

              <div className={styles.keyBox}>
                <div className={styles.keyText}>
                  <span>•••••-•••••-•••••</span>
                </div>
                <button className={styles.revealBtn}>Revelar Chave</button>
              </div>

              <div className={styles.guideLink}>
                <ShieldCheck size={16} className={styles.successIcon} />
                <a href="/help/steam-guide" target="_blank">Como ativar na Steam &rarr;</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
