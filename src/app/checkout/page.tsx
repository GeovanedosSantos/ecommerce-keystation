import Link from "next/link";
import { CreditCard, QrCode, FileText, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout Seguro</h1>

      <div className={styles.layout}>
        {/* Payment Methods */}
        <div className={styles.mainContent}>
          <div className={styles.cardSection}>
            <h2>Selecione o Método de Pagamento</h2>
            
            <div className={styles.paymentMethods}>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" defaultChecked />
                <div className={styles.optionContent}>
                  <QrCode size={24} className={styles.optionIcon} />
                  <div>
                    <strong>Pix (Instantâneo)</strong>
                    <span>Aprovação imediata e liberação instantânea no cofre</span>
                  </div>
                </div>
              </label>

              <label className={styles.paymentOption}>
                <input type="radio" name="payment" />
                <div className={styles.optionContent}>
                  <CreditCard size={24} className={styles.optionIcon} />
                  <div>
                    <strong>Cartão de Crédito</strong>
                    <span>Parcele em até 12x com segurança</span>
                  </div>
                </div>
              </label>

              <label className={styles.paymentOption}>
                <input type="radio" name="payment" />
                <div className={styles.optionContent}>
                  <FileText size={24} className={styles.optionIcon} />
                  <div>
                    <strong>Boleto Bancário</strong>
                    <span>Compensação em até 1 dia útil</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.cardSection}>
            <h2>Simulação de Pagamento Pix</h2>
            <div className={styles.pixBox}>
              <div className={styles.qrPlaceholder}>
                <QrCode size={120} color="var(--primary)" />
              </div>
              <div className={styles.pixInstructions}>
                <p>Escaneie o QR Code acima com o aplicativo do seu banco ou copie a chave abaixo:</p>
                <div className={styles.pixKeyRow}>
                  <input type="text" readOnly value="00020126580014br.gov.bcb.pix..." />
                  <button className={styles.copyBtn}>Copiar Chave</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Finalize */}
        <div className={styles.sidebar}>
          <div className={styles.summaryBox}>
            <h2>Resumo da Compra</h2>
            <div className={styles.summaryRow}>
              <span>2 jogos</span>
              <span>R$ 279,89</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Taxa de Entrega Digital</span>
              <span className={styles.free}>Grátis</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total a Pagar</span>
              <span>R$ 279,89</span>
            </div>

            <Link href="/checkout/success" className={styles.finalizeBtn}>
              <Lock size={16} /> Finalizar Pedido
            </Link>

            <div className={styles.securityNote}>
              <ShieldCheck size={18} className={styles.successIcon} />
              <span>Ambiente 100% seguro com criptografia SSL. Chaves verificadas.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
