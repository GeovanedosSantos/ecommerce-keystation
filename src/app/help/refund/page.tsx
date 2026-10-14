import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import styles from "../help.module.css";

export default function RefundPage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} /> Voltar para a Loja
      </Link>

      <div className={styles.card}>
        <h1><ShieldCheck size={28} /> Política de Reembolso</h1>
        <p className={styles.subtitle}>Garantia e regras de reembolso do Ecommerce Keystation</p>

        <div className={styles.contentBody}>
          <h3>1. Condições para Reembolso</h3>
          <p>O reembolso pode ser solicitado em até 7 dias corridos após a compra, desde que a chave digital <strong>ainda não tenha sido revelada</strong> no cofre do cliente.</p>

          <h3>2. Chaves com Defeito</h3>
          <p>Caso a chave digital apresente qualquer falha de ativação comprovada, nossa equipe efetuará a substituição imediata ou o reembolso integral do valor pago após análise do suporte.</p>
        </div>
      </div>
    </div>
  );
}
