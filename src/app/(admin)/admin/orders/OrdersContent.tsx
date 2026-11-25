import styles from "../admin.module.css";

export function OrdersContent() {
  return (
    <div className={styles.contentArea}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTextGroup}>
          <span className={styles.sectionBadge}>ADMINISTRAÇÃO / VENDAS</span>
          <h1 className={styles.sectionTitle}>Gerenciamento de Pedidos</h1>
          <p className={styles.sectionSubtitle}>
            Visualize e acompanhe todos os pedidos realizados na KeyStation.
          </p>
        </div>
      </div>

      <div className={styles.recentOrdersCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.orderId}>#12345</td>
                <td>Rafael Costa</td>
                <td>05/10/2026</td>
                <td>2 jogos</td>
                <td>R$ 140,00</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                    Aprovado
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.orderId}>#12344</td>
                <td>Rafael Costa</td>
                <td>04/10/2026</td>
                <td>2 jogos</td>
                <td>R$ 60,00</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                    Pendente
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.orderId}>#12343</td>
                <td>Rafael Costa</td>
                <td>03/10/2026</td>
                <td>1 jogo</td>
                <td>R$ 120,00</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusCanceled}`}>
                    Cancelado
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.orderId}>#12342</td>
                <td>Marina Lima</td>
                <td>03/10/2026</td>
                <td>2 chaves</td>
                <td>R$ 80,00</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                    Aprovado
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.orderId}>#12341</td>
                <td>Bruno Alves</td>
                <td>01/10/2026</td>
                <td>1 jogo</td>
                <td>R$ 200,00</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                    Aprovado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.adminFooterDisclaimer}>
        Dados demonstrativos · Atualizado em 05/10/2026 às 14:32
      </p>
    </div>
  );
}
