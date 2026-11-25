import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { CoverImage } from "@/components/ui/CoverImage/CoverImage";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { getCart } from "@/core/modules/cart/cart.service";
import { getSession } from "@/infra/session-cookie";
import { formatBRL } from "./format";
import ConfirmOrderForm from "./ConfirmOrderForm";
import styles from "./checkout.module.css";

async function CheckoutContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cart = await getCart(session.userId);
  if (cart.items.length === 0) redirect("/cart");
  const { totals } = cart;

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <div className={styles.cardSection}>
          <h2>Revise seu pedido</h2>
          <ul className={styles.itemList}>
            {cart.items.map((item) => (
              <li key={item.variantId} className={styles.item}>
                <CoverImage src={item.coverPath} alt={item.title} size="thumb" />
                <span className={styles.itemTitle}>{item.title}</span>
                <strong className={styles.itemPrice}>{formatBRL(item.priceCents)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.cardSection}>
          <h2>Resumo da Compra</h2>
          <div className={styles.summaryRow}>
            <span>{cart.items.length} {cart.items.length === 1 ? "jogo" : "jogos"}</span>
            <span>{formatBRL(totals.subtotalCents)}</span>
          </div>
          {totals.discountCents > 0 && (
            <div className={styles.summaryRow}>
              <span>Desconto{cart.coupon ? ` (${cart.coupon.code})` : ""}</span>
              <span className={styles.free}>- {formatBRL(totals.discountCents)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>Taxa de Entrega Digital</span>
            <span className={styles.free}>Grátis</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total a Pagar</span>
            <span>{formatBRL(totals.totalCents)}</span>
          </div>

          <ConfirmOrderForm />

          <div className={styles.securityNote}>
            <ShieldCheck size={18} className={styles.successIcon} />
            <span>
              Ao confirmar, reservamos suas chaves por 15 minutos para você concluir o pagamento.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageContainer>
      <SectionHeader level="page" title="Checkout Seguro" />
      <Suspense fallback={<p>Carregando checkout...</p>}>
        <CheckoutContent />
      </Suspense>
    </PageContainer>
  );
}
