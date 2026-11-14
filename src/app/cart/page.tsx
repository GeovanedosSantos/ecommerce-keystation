import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { CoverImage } from "@/components/ui/CoverImage/CoverImage";
import { getCart } from "@/core/modules/cart/cart.service";
import { getSession } from "@/infra/session-cookie";
import { removeFromCartAction } from "./actions";
import CouponForm from "./CouponForm";
import styles from "./cart.module.css";

function formatBRL(cents: number) {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

async function CartContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cart = await getCart(session.userId);
  const { totals } = cart;

  if (cart.items.length === 0) {
    return (
      <>
        <SectionHeader
          level="page"
          icon={<ShoppingBag size={28} />}
          title="Meu Carrinho (0)"
        />
        <p>Seu carrinho está vazio.</p>
        <Button href="/catalog" inline>
          Explorar o catálogo
        </Button>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        level="page"
        icon={<ShoppingBag size={28} />}
        title={`Meu Carrinho (${cart.items.length})`}
      />

      <div className={styles.layout}>
        <div className={styles.itemsList}>
          {cart.items.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <CoverImage
                src={item.coverPath}
                alt={item.title}
                size="thumb"
              />
              <div className={styles.itemDetails}>
                <h3>{item.title}</h3>
                <span className={styles.platform}>Ativação Steam (PC)</span>
              </div>
              <Price
                value={item.priceCents / 100}
                originalValue={item.originalPriceCents / 100}
                size="md"
              />
              <form action={removeFromCartAction.bind(null, item.productId)}>
                <Button
                  type="submit"
                  variant="danger"
                  size="icon"
                  aria-label={`Remover ${item.title}`}
                >
                  <Trash2 size={18} />
                </Button>
              </form>
            </div>
          ))}
        </div>

        <div className={styles.summaryBox}>
          <h2>Resumo do Pedido</h2>

          <CouponForm appliedCode={cart.coupon?.code ?? null} />

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatBRL(totals.subtotalCents)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Desconto</span>
            <span className={styles.discount}>
              {totals.discountCents > 0
                ? `- ${formatBRL(totals.discountCents)}`
                : "R$ 0,00"}
            </span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{formatBRL(totals.totalCents)}</span>
          </div>

          <Button href="/checkout">
            Ir para o Checkout <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <PageContainer>
      <Suspense fallback={<p>Carregando carrinho...</p>}>
        <CartContent />
      </Suspense>
    </PageContainer>
  );
}