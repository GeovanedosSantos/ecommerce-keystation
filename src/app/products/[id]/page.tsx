import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingCart, ShieldCheck, Zap, Cpu, HardDrive, Monitor, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { getGameDetail } from "@/utils/mock/games";
import styles from "./product.module.css";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const game = getGameDetail(id);
  if (!game) notFound();

  const promo = game.promotionalPrice;
  const hasPromo = promo !== null && promo < game.price;
  const finalPrice = hasPromo ? promo : game.price;
  const discount = hasPromo ? Math.round(((game.price - promo) / game.price) * 100) : 0;

  return (
    <PageContainer gap="none">
      <div className={styles.mainGrid}>
        {/* Left: Gallery & Info */}
        <div className={styles.leftCol}>
          <div className={styles.bannerWrapper}>
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              priority
              className={styles.bannerImage}
            />
            <span className={styles.categoryBadge}>{game.categoryName}</span>
          </div>

          <div className={styles.section}>
            <h2>Sobre o Jogo</h2>
            <p className={styles.description}>{game.description}</p>
          </div>

          <div className={styles.section}>
            <h2>Requisitos de Sistema (PC)</h2>
            <div className={styles.requirementsBox}>
              <div className={styles.reqItem}>
                <Monitor size={18} className={styles.reqIcon} />
                <div>
                  <strong>Sistema Operacional:</strong>
                  <span>{game.requirements.os}</span>
                </div>
              </div>
              <div className={styles.reqItem}>
                <Cpu size={18} className={styles.reqIcon} />
                <div>
                  <strong>Processador:</strong>
                  <span>{game.requirements.processor}</span>
                </div>
              </div>
              <div className={styles.reqItem}>
                <HardDrive size={18} className={styles.reqIcon} />
                <div>
                  <strong>Memória & Armazenamento:</strong>
                  <span>{game.requirements.memory} | {game.requirements.storage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className={styles.rightCol}>
          <div className={styles.buyBox}>
            <span className={styles.platform}>
              <CheckCircle2 size={16} className={styles.successIcon} /> Ativação Oficial via {game.platform}
            </span>
            <h1 className={styles.title}>{game.title}</h1>
            <div className={styles.devInfo}>
              <span>Desenvolvedora: <strong>{game.developer}</strong></span>
              <span>Distribuidora: <strong>{game.publisher}</strong></span>
            </div>

            <div className={styles.pricingSection}>
              <Price value={finalPrice} originalValue={game.price} size="lg" />
              {hasPromo && <span className={styles.discountTag}>-{discount}% OFF</span>}
            </div>

            <div className={styles.featuresList}>
              <div className={styles.featureRow}>
                <Zap size={16} className={styles.featIcon} />
                <span>Entrega Instantânea no Cofre</span>
              </div>
              <div className={styles.featureRow}>
                <ShieldCheck size={16} className={styles.featIcon} />
                <span>Garantia de Funcionamento</span>
              </div>
            </div>

            <Button href="/cart">
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
