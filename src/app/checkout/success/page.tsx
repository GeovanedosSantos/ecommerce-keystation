import Link from "next/link";
import { CheckCircle2, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./success.module.css";

export default function CheckoutSuccessPage() {
  const orderNumber = "KS-849204";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={64} className={styles.successIcon} />
        </div>

        <h1>Pagamento Aprovado!</h1>
        <p className={styles.subtitle}>
          Seu pedido <strong>{orderNumber}</strong> foi processado com sucesso e suas chaves digitais já estão disponíveis no seu cofre.
        </p>

        <div className={styles.actions}>
          <Link href="/account/vault" className={styles.vaultBtn}>
            <KeyRound size={18} /> Ir para o Meu Cofre (Minhas Chaves)
          </Link>
          <Link href="/catalog" className={styles.catalogBtn}>
            Continuar Comprando <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
