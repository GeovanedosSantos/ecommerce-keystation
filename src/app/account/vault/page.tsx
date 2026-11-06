import { KeyRound, ShieldCheck, ExternalLink, Copy } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { CoverImage, CoverBadge } from "@/components/ui/CoverImage/CoverImage";
import { VAULT_KEYS } from "@/utils/mock/vault";
import styles from "./vault.module.css";

export default function VaultPage() {
  return (
    <PageContainer>
      <SectionHeader
        level="page"
        icon={<KeyRound size={28} />}
        title="Meu Cofre (Minhas Chaves)"
        description={<>Aqui estão todas as suas chaves digitais adquiridas. Clique em &quot;Revelar Chave&quot; para visualizar e copiar.</>}
      />

      <div className={styles.grid}>
        {VAULT_KEYS.map((item) => (
          <div key={item.id} className={styles.vaultCard}>
            <CoverImage src={item.coverImage} alt={item.gameTitle} size="banner">
              <CoverBadge position="top-right">{item.platform}</CoverBadge>
            </CoverImage>

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
    </PageContainer>
  );
}
