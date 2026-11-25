"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  ArrowRight,
  CreditCard,
  FileText,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import styles from "./admin.module.css";

export function OverviewContent() {
  const [notification, setNotification] = useState<string | null>(null);

  function handleExport() {
    setNotification("Relatório exportado com sucesso!");
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className={styles.contentArea}>
      {notification && (
        <div className={styles.notificationBanner}>
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabeçalho da Visão Geral */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTextGroup}>
          <span className={styles.sectionBadge}>PAINEL DA LOJA</span>
          <h1 className={styles.sectionTitle}>Visão geral</h1>
          <p className={styles.sectionSubtitle}>
            Acompanhe suas vendas e os pedidos da KeyStation.
          </p>
        </div>

        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExport}
        >
          <span>Exportar relatório</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Sub-barra de Filtro */}
      <div className={styles.filterBar}>
        <select className={styles.dateSelect} aria-label="Período do relatório">
          <option>01/10/2026 a 05/10/2026</option>
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Todo o histórico</option>
        </select>

        <span className={styles.filterNote}>
          Base demonstrativa: 5 pedidos no período
        </span>
      </div>

      {/* Grid com 4 Cartões de Métricas */}
      <div className={styles.metricsRow}>
        {/* Card 1: Faturamento Aprovado */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span>Faturamento aprovado</span>
            <CreditCard size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>R$ 420,00</div>
          <div className={styles.metricSub}>3 pedidos aprovados</div>
        </div>

        {/* Card 2: Pedidos Recebidos */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span>Pedidos recebidos</span>
            <FileText size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>5</div>
          <div className={styles.metricSub}>1 pendente · 1 cancelado</div>
        </div>

        {/* Card 3: Chaves Vendidas */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span>Chaves vendidas</span>
            <KeyRound size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>5</div>
          <div className={styles.metricSub}>Somente pagamentos aprovados</div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span>Ticket médio</span>
            <BarChart2 size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>R$ 140,00</div>
          <div className={styles.metricSub}>R$ 420,00 ÷ 3 pedidos</div>
        </div>
      </div>

      {/* Linha com Gráfico de Evolução e Top Jogos */}
      <div className={styles.chartsRow}>
        {/* Gráfico de Barras: Evolução do Faturamento */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h2 className={styles.chartTitle}>Evolução do faturamento</h2>
              <span className={styles.chartSubtitle}>
                Receita por dia · Outubro de 2026
              </span>
            </div>
            <span className={styles.chartTag}>Pagamentos aprovados</span>
          </div>

          <div className={styles.barChartContainer}>
            {/* Dia 01/10: R$ 200 */}
            <div className={styles.barCol}>
              <span className={styles.barValue}>R$ 200</span>
              <div
                className={`${styles.barPillar} ${styles.barPurple}`}
                style={{ height: "130px" }}
              />
              <span className={styles.barDate}>01/10</span>
            </div>

            {/* Dia 02/10: R$ 0 */}
            <div className={styles.barCol}>
              <span className={styles.barValue}>R$ 0</span>
              <div className={styles.barFlat} />
              <span className={styles.barDate}>02/10</span>
            </div>

            {/* Dia 03/10: R$ 80 */}
            <div className={styles.barCol}>
              <span className={styles.barValue}>R$ 80</span>
              <div
                className={`${styles.barPillar} ${styles.barPurple}`}
                style={{ height: "55px" }}
              />
              <span className={styles.barDate}>03/10</span>
            </div>

            {/* Dia 04/10: R$ 0 */}
            <div className={styles.barCol}>
              <span className={styles.barValue}>R$ 0</span>
              <div className={styles.barFlat} />
              <span className={styles.barDate}>04/10</span>
            </div>

            {/* Dia 05/10: R$ 140 (Ciano) */}
            <div className={styles.barCol}>
              <span className={styles.barValue}>R$ 140</span>
              <div
                className={`${styles.barPillar} ${styles.barCyan}`}
                style={{ height: "95px" }}
              />
              <span className={styles.barDate}>05/10</span>
            </div>
          </div>
        </div>

        {/* Lista: Jogos Vendidos */}
        <div className={styles.topGamesCard}>
          <div className={styles.chartTitleGroup}>
            <h2 className={styles.chartTitle}>Jogos vendidos</h2>
            <span className={styles.chartSubtitle}>
              Receita aprovada no período
            </span>
          </div>

          <div className={styles.topGamesList}>
            <div className={styles.topGameItem}>
              <div className={styles.topGameInfo}>
                <span className={styles.topGameName}>ELDEN RING</span>
                <span className={styles.topGameCount}>1 chave</span>
              </div>
              <span className={styles.topGameRevenue}>R$ 200,00</span>
            </div>

            <div className={styles.topGameItem}>
              <div className={styles.topGameInfo}>
                <span className={styles.topGameName}>Hades</span>
                <span className={styles.topGameCount}>3 chaves</span>
              </div>
              <span className={styles.topGameRevenue}>R$ 120,00</span>
            </div>

            <div className={styles.topGameItem}>
              <div className={styles.topGameInfo}>
                <span className={styles.topGameName}>Cyberpunk 2077</span>
                <span className={styles.topGameCount}>1 chave</span>
              </div>
              <span className={styles.topGameRevenue}>R$ 100,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos Recentes */}
      <div className={styles.recentOrdersCard}>
        <div className={styles.recentOrdersHeader}>
          <h2 className={styles.recentOrdersTitle}>Pedidos recentes</h2>
          <Link href="/admin/orders" className={styles.viewAllLink}>
            <span>Ver todos</span>
            <ArrowRight size={14} />
          </Link>
        </div>

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
