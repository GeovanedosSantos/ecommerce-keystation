import Link from "next/link";
import { CheckCircle2, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import styles from "./success.module.css";

export default function CheckoutSuccessPage() {
  const orderNumber = "KS-849204";

  return (
    <PageContainer width="md" paddingY="2xl" gap="none">
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={64} className={styles.successIcon} />
        </div>

        <h1>Pagamento Aprovado!</h1>
        <p className={styles.subtitle}>
          Seu pedido <strong>{orderNumber}</strong> foi processado com sucesso e suas chaves digitais já estão disponíveis no seu cofre.
        </p>

        <div className={styles.actions}>
          <Button href="/account/vault">
            <KeyRound size={18} /> Ir para o Meu Cofre (Minhas Chaves)
          </Button>
          <Link href="/catalog" className={styles.catalogBtn}>
            Continuar Comprando <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
