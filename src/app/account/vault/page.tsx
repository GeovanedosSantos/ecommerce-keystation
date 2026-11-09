import { KeyRound } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { VAULT_KEYS } from "@/utils/mock/vault";
import { VaultKeyCard } from "./VaultKeyCard";
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
          <VaultKeyCard key={item.id} item={item} />
        ))}
      </div>
    </PageContainer>
  );
}
