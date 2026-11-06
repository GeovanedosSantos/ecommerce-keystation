import { Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { CoverImage } from "@/components/ui/CoverImage/CoverImage";
import styles from "./cart.module.css";

const CART_ITEMS = [
  {
    id: "1",
    title: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    price: 99.99,
  },
  {
    id: "2",
    title: "Elden Ring: Shadow of the Erdtree",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    price: 179.90,
  },
];

export default function CartPage() {
  const subtotal = CART_ITEMS.reduce((acc, item) => acc + item.price, 0);

  return (
    <PageContainer>
      <SectionHeader
        level="page"
        icon={<ShoppingBag size={28} />}
        title={`Meu Carrinho (${CART_ITEMS.length})`}
      />

      <div className={styles.layout}>
        <div className={styles.itemsList}>
          {CART_ITEMS.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <CoverImage src={item.coverImage} alt={item.title} size="thumb" />
              <div className={styles.itemDetails}>
                <h3>{item.title}</h3>
                <span className={styles.platform}>Ativação Steam (PC)</span>
              </div>
              <Price value={item.price} size="md" />
              <Button variant="danger" size="icon" aria-label="Remover">
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        <div className={styles.summaryBox}>
          <h2>Resumo do Pedido</h2>
          
          <div className={styles.couponSection}>
            <div className={styles.couponInputWrapper}>
              <Tag size={16} />
              <input type="text" placeholder="Cupom de desconto" />
            </div>
            <button className={styles.couponBtn}>Aplicar</button>
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Desconto</span>
            <span className={styles.discount}>R$ 0,00</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          <Button href="/checkout">
            Ir para o Checkout <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
