"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  ScrollText,
  KeyRound,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import {
  MOCK_ORDERS,
  type OrderHistoryItem,
  type OrderStatus,
} from "@/utils/mock/orders";
import styles from "./orders.module.css";

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function OrdersContent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    MOCK_ORDERS[0]?.id ?? ""
  );

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const selectedOrder =
    MOCK_ORDERS.find((o) => o.id === selectedOrderId) ?? MOCK_ORDERS[0];

  return (
    <PageContainer>
      <div className={styles.ordersPage}>
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className={styles.breadcrumb}>
          <Link href="/">Início</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/account">Minha conta</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Meus Pedidos</span>
        </nav>

        {/* Cabeçalho */}
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>Meus Pedidos</h1>
          <p className={styles.subtitle}>
            Acompanhe suas compras e acesse os detalhes de cada pedido.
          </p>
        </div>

        {/* Grid Principal (2 Colunas) */}
        <div className={styles.grid}>
          {/* Coluna da Esquerda: Sidebar do Usuário */}
          <aside className={styles.userSidebar} aria-label="Menu da Conta">
            <div className={styles.userProfileSnippet}>
              <div className={styles.avatarLarge}>RC</div>
              <div>
                <h2 className={styles.userName}>Rafael Costa</h2>
                <span className={styles.userMemberSince}>
                  Membro desde setembro de 2026
                </span>
              </div>
            </div>

            <nav className={styles.navMenu}>
              <Link href="/account" className={styles.navItem}>
                <User size={18} />
                <span>Meus Dados</span>
              </Link>

              <Link
                href="/account/orders"
                className={`${styles.navItem} ${styles.navItemActive}`}
              >
                <ScrollText size={18} />
                <span>Meus Pedidos</span>
              </Link>

              <Link href="/account/vault" className={styles.navItem}>
                <KeyRound size={18} />
                <span>Minhas Chaves</span>
              </Link>

              <div className={styles.navDivider} />

              <Link
                href="/login"
                className={`${styles.navItem} ${styles.navItemLogout}`}
              >
                <LogOut size={18} />
                <span>Sair</span>
              </Link>
            </nav>
          </aside>

          {/* Coluna da Direita: Histórico e Detalhes */}
          <main className={styles.mainPanel}>
            {/* Card Superior: Histórico de Compras */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Histórico de compras</h2>

                <select
                  aria-label="Filtrar por status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos os status</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Tabela de Pedidos */}
              <div className={styles.tableWrapper}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Número do Pedido</th>
                      <th>Data da Compra</th>
                      <th>Itens</th>
                      <th>Valor Total</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isSelected = order.id === selectedOrder?.id;

                      let statusClass = styles.statusApproved;
                      if (order.status === "Pendente") statusClass = styles.statusPending;
                      if (order.status === "Cancelado") statusClass = styles.statusCanceled;

                      return (
                        <tr
                          key={order.id}
                          className={`${styles.orderRow} ${
                            isSelected ? styles.orderRowSelected : ""
                          }`}
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <td className={styles.orderNumber}>
                            {order.orderNumber}
                          </td>
                          <td className={styles.orderDate}>{order.date}</td>
                          <td>
                            <div className={styles.orderItemsCell}>
                              <span className={styles.orderItemSummary}>
                                {order.itemSummary}
                              </span>
                              <span className={styles.orderItemCount}>
                                {order.itemCountLabel}
                              </span>
                            </div>
                          </td>
                          <td className={styles.orderTotal}>
                            {formatBRL(order.total)}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.detailsBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderId(order.id);
                              }}
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <span className={styles.cardFooterNote}>
                {MOCK_ORDERS.length} pedidos · Histórico demonstrativo
              </span>
            </div>

            {/* Card Inferior: Detalhes do Pedido Selecionado */}
            {selectedOrder && (
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <h3 className={styles.detailsTitle}>
                    Detalhes do pedido {selectedOrder.orderNumber}
                  </h3>

                  <span className={styles.paidBadge}>
                    {selectedOrder.status === "Aprovado"
                      ? "Pagamento aprovado"
                      : `Status: ${selectedOrder.status}`}
                  </span>
                </div>

                {/* Lista de Itens do Pedido */}
                <div className={styles.detailsItemsList}>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className={styles.detailItemRow}>
                      <div className={styles.detailItemLeft}>
                        <div className={styles.detailItemThumb}>
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="72px"
                            className={styles.detailItemThumbImg}
                          />
                        </div>
                        <div className={styles.detailItemInfo}>
                          <span className={styles.detailItemTitle}>
                            {item.title}
                          </span>
                          <span className={styles.detailItemSub}>
                            {item.platform} · {item.keyCount}{" "}
                            {item.keyCount === 1 ? "chave" : "chaves"}
                          </span>
                        </div>
                      </div>

                      <span className={styles.detailItemPrice}>
                        {formatBRL(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rodapé dos Detalhes */}
                <div className={styles.detailsFooter}>
                  <div className={styles.detailsFooterLeft}>
                    <div>
                      Compra: {selectedOrder.date} · {selectedOrder.paymentMethod}
                    </div>
                    <div>
                      Total pago:{" "}
                      <span className={styles.detailsTotalHighlight}>
                        {formatBRL(selectedOrder.total)}
                      </span>{" "}
                      · {selectedOrder.items.length}{" "}
                      {selectedOrder.items.length === 1
                        ? "chave digital"
                        : "chaves digitais"}
                    </div>
                  </div>

                  <Link href="/account/vault" className={styles.accessVaultBtn}>
                    <KeyRound size={16} />
                    <span>Acessar Minhas Chaves</span>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
