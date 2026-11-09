import type { Metadata } from "next";
import Link from "next/link";
import { Package, Clock, CheckCircle2, XCircle, ArrowRight, Vault } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { CoverImage } from "@/components/ui/CoverImage/CoverImage";
import { Price } from "@/components/ui/Price/Price";
import { MOCK_ORDERS, type OrderStatus } from "@/utils/mock/orders";
import styles from "./orders.module.css";

export const metadata: Metadata = {
  title: "Meus Pedidos | KeyStation",
  description: "Histórico completo dos seus pedidos e compras no KeyStation.",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === "Aprovado") {
    return (
      <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
        <CheckCircle2 size={14} />
        <span>Aprovado</span>
      </span>
    );
  }

  if (status === "Pendente") {
    return (
      <span className={`${styles.statusBadge} ${styles.statusPending}`}>
        <Clock size={14} />
        <span>Pendente</span>
      </span>
    );
  }

  return (
    <span className={`${styles.statusBadge} ${styles.statusCanceled}`}>
      <XCircle size={14} />
      <span>Cancelado</span>
    </span>
  );
}

export default function OrdersPage() {
  return (
    <PageContainer>
      <SectionHeader
        level="page"
        icon={<Package size={28} />}
        title="Meus Pedidos"
        description={<>Acompanhe todos os seus pedidos de chaves digitais e histórico de compras.</>}
      />

      <div className={styles.ordersList}>
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            {/* Cabeçalho do Card com Metadados */}
            <div className={styles.orderHeader}>
              <div className={styles.orderHeaderLeft}>
                <div className={styles.orderMetaGroup}>
                  <span className={styles.orderMetaLabel}>Número do Pedido</span>
                  <span className={`${styles.orderMetaValue} ${styles.orderNumber}`}>
                    {order.orderNumber}
                  </span>
                </div>

                <div className={styles.orderMetaGroup}>
                  <span className={styles.orderMetaLabel}>Data</span>
                  <span className={styles.orderMetaValue}>{order.date}</span>
                </div>

                <div className={styles.orderMetaGroup}>
                  <span className={styles.orderMetaLabel}>Pagamento</span>
                  <span className={styles.orderMetaValue}>{order.paymentMethod}</span>
                </div>

                <div className={styles.orderMetaGroup}>
                  <span className={styles.orderMetaLabel}>Total</span>
                  <Price value={order.total} size="md" />
                </div>
              </div>

              <StatusBadge status={order.status} />
            </div>

            {/* Lista de Itens do Pedido */}
            <div className={styles.orderItems}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.orderItemRow}>
                  <div className={styles.orderItemInfo}>
                    <div className={styles.orderItemThumb}>
                      <CoverImage src={item.coverImage} alt={item.title} size="thumb" />
                    </div>
                    <div className={styles.orderItemDetails}>
                      <h4 className={styles.orderItemTitle}>{item.title}</h4>
                      <span className={styles.orderItemPlatform}>{item.platform}</span>
                    </div>
                  </div>

                  <Price value={item.price} size="sm" />
                </div>
              ))}
            </div>

            {/* Rodapé do Card com Ação rápida para o Cofre quando Aprovado */}
            {order.status === "Aprovado" && (
              <div className={styles.orderFooter}>
                <span className={styles.orderMetaLabel}>Chaves liberadas e prontas para resgate</span>
                <Link href="/account/vault" className={styles.vaultActionLink}>
                  <Vault size={16} />
                  <span>Acessar chaves no Cofre</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
