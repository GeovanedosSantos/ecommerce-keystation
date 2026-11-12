"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  KeyRound,
  LayoutDashboard,
  Gamepad2,
  ReceiptText,
  Settings,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileText,
  BarChart2,
  Trash2,
  ImagePlus,
  Info,
  Save,
  Plus,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import styles from "./admin.module.css";

type AdminSection = "overview" | "games" | "orders";

export function AdminContent() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  // Estados do formulário de cadastro de jogos para prévia ao vivo
  const [gameTitle, setGameTitle] = useState("Neon Drift");
  const [gameCategory, setGameCategory] = useState("Ação · Corrida");
  const [gamePrice, setGamePrice] = useState("R$ 120,00");
  const [gameDescription, setGameDescription] = useState(
    "Domine as ruas de uma metrópole neon. Ajuste seu carro, desafie circuitos urbanos e encontre a linha perfeita em uma experiência de corrida arcade."
  );
  const [gameDeveloper, setGameDeveloper] = useState("Neon Forge Studio");
  const [gamePlatform, setGamePlatform] = useState("Steam");
  const [gameRegion, setGameRegion] = useState("Brasil");
  const [compatWindows, setCompatWindows] = useState(true);
  const [compatMac, setCompatMac] = useState(true);

  const [notification, setNotification] = useState<string | null>(null);

  function handleSave(action: string) {
    setNotification(action);
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className={styles.adminLayout}>
      {/* ========================================================
          SIDEBAR DEDICADA DA ADMINISTRAÇÃO
          ======================================================== */}
      <aside className={styles.adminSidebar} aria-label="Menu da Administração">
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarBrand}>
            <div className={styles.sidebarBrandBadge}>
              <KeyRound size={18} className={styles.sidebarBrandKey} />
            </div>
            <span className={styles.sidebarBrandText}>
              Key<span className={styles.sidebarBrandHighlight}>Station</span>
            </span>
          </Link>

          <span className={styles.sidebarBadgeText}>ADMINISTRAÇÃO</span>

          <nav className={styles.sidebarNav}>
            {/* 1. Visão Geral */}
            <button
              type="button"
              className={`${styles.navItem} ${
                activeSection === "overview" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveSection("overview")}
            >
              <LayoutDashboard size={18} />
              <span>Visão geral</span>
            </button>

            {/* 2. Jogos */}
            <button
              type="button"
              className={`${styles.navItem} ${
                activeSection === "games" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveSection("games")}
            >
              <Gamepad2 size={18} />
              <span>Jogos</span>
            </button>

            {/* 3. Pedidos */}
            <button
              type="button"
              className={`${styles.navItem} ${
                activeSection === "orders" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveSection("orders")}
            >
              <ReceiptText size={18} />
              <span>Pedidos</span>
            </button>

            {/* 4. Estoque de chaves (ignorado/desabilitado conforme solicitado) */}
            <div
              className={`${styles.navItem} ${styles.navItemDisabled}`}
              title="Seção ignorada conforme diretriz"
            >
              <KeyRound size={18} />
              <span>Estoque de chaves</span>
            </div>

            {/* 5. Configurações (ignorado/desabilitado conforme solicitado) */}
            <div
              className={`${styles.navItem} ${styles.navItemDisabled}`}
              title="Seção ignorada conforme diretriz"
            >
              <Settings size={18} />
              <span>Configurações</span>
            </div>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <p className={styles.sidebarBottomText}>
            Área exclusiva dos donos da loja.
            <br />
            Não é um marketplace.
          </p>

          <Link href="/" className={styles.backToStoreLink}>
            <ArrowLeft size={16} />
            <span>Voltar para a loja</span>
          </Link>
        </div>
      </aside>

      {/* ========================================================
          ÁREA DE CONTEÚDO PRINCIPAL
          ======================================================== */}
      <div className={styles.adminMain}>
        {/* Barra Superior */}
        <header className={styles.topBar}>
          <nav aria-label="Navegação estrutural" className={styles.breadcrumb}>
            <span>KeyStation</span>
            <span>/</span>
            <span>Administração</span>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>
              {activeSection === "overview" && "Visão geral"}
              {activeSection === "games" && "Jogos"}
              {activeSection === "orders" && "Pedidos"}
            </span>
          </nav>

          <span className={styles.adminBadge}>Administrador · RC</span>
        </header>

        {/* Notificação Temporária de Ação */}
        {notification && (
          <div
            style={{
              margin: "1rem 2rem -1rem 2rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#10B981",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* ========================================================
            SEÇÃO 1: VISÃO GERAL (IMAGEM 1)
            ======================================================== */}
        {activeSection === "overview" && (
          <div className={styles.contentArea}>
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
                onClick={() => handleSave("Relatório exportado com sucesso!")}
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
                <button
                  type="button"
                  className={styles.viewAllLink}
                  onClick={() => setActiveSection("orders")}
                >
                  <span>Ver todos</span>
                  <ArrowRight size={14} />
                </button>
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
        )}

        {/* ========================================================
            SEÇÃO 2: CADASTRO DE JOGOS (IMAGEM 2)
            ======================================================== */}
        {activeSection === "games" && (
          <div className={styles.contentArea}>
            {/* Cabeçalho da Seção */}
            <div className={styles.sectionHeader}>
              <div className={styles.headerTextGroup}>
                <span className={styles.sectionBadge}>CATÁLOGO / NOVO JOGO</span>
                <h1 className={styles.sectionTitle}>Cadastro de Jogos</h1>
                <p className={styles.sectionSubtitle}>
                  Organize as informações e a apresentação do produto antes de publicar.
                </p>
              </div>
            </div>

            {/* Layout em 2 Colunas */}
            <div className={styles.gamesLayout}>
              {/* Coluna da Esquerda: Formulários */}
              <div className={styles.formColumn}>
                {/* 1. Informações do jogo */}
                <div className={styles.formCard}>
                  <div className={styles.cardHeaderWithBadge}>
                    <h3 className={styles.cardTitleH3}>Informações do jogo</h3>
                    <span className={styles.draftBadge}>RASCUNHO</span>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="game-title" className={styles.inputLabel}>
                      Título do jogo
                    </label>
                    <input
                      id="game-title"
                      type="text"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="game-desc" className={styles.inputLabel}>
                      Descrição
                    </label>
                    <textarea
                      id="game-desc"
                      rows={4}
                      value={gameDescription}
                      onChange={(e) => setGameDescription(e.target.value)}
                      className={`${styles.inputField} ${styles.textareaField}`}
                    />
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="game-dev" className={styles.inputLabel}>
                        Desenvolvedora
                      </label>
                      <input
                        id="game-dev"
                        type="text"
                        value={gameDeveloper}
                        onChange={(e) => setGameDeveloper(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="game-cat" className={styles.inputLabel}>
                        Categoria
                      </label>
                      <select
                        id="game-cat"
                        value={gameCategory}
                        onChange={(e) => setGameCategory(e.target.value)}
                        className={styles.inputField}
                      >
                        <option>Ação · Corrida</option>
                        <option>Ação · RPG</option>
                        <option>Aventura</option>
                        <option>Estratégia</option>
                        <option>Indie</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Preço e ativação */}
                <div className={styles.formCard}>
                  <h3 className={styles.cardTitleH3}>Preço e ativação</h3>

                  <div className={styles.row2}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="sale-price" className={styles.inputLabel}>
                        Preço de venda
                      </label>
                      <input
                        id="sale-price"
                        type="text"
                        value={gamePrice}
                        onChange={(e) => setGamePrice(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="orig-price" className={styles.inputLabel}>
                        Preço original (opcional)
                      </label>
                      <input
                        id="orig-price"
                        type="text"
                        placeholder="Digite para criar uma oferta"
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="platform" className={styles.inputLabel}>
                        Plataforma
                      </label>
                      <select
                        id="platform"
                        value={gamePlatform}
                        onChange={(e) => setGamePlatform(e.target.value)}
                        className={styles.inputField}
                      >
                        <option>Steam</option>
                        <option>Epic Games</option>
                        <option>GOG</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="region" className={styles.inputLabel}>
                        Região de ativação
                      </label>
                      <select
                        id="region"
                        value={gameRegion}
                        onChange={(e) => setGameRegion(e.target.value)}
                        className={styles.inputField}
                      >
                        <option>Brasil</option>
                        <option>Global</option>
                        <option>América Latina</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.compatSection}>
                    <span className={styles.inputLabel}>Sistemas compatíveis</span>
                    <div className={styles.compatOptions}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={compatWindows}
                          onChange={(e) => setCompatWindows(e.target.checked)}
                        />
                        <span>Windows</span>
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={compatMac}
                          onChange={(e) => setCompatMac(e.target.checked)}
                        />
                        <span>macOS</span>
                      </label>
                    </div>
                    <span className={styles.compatNote}>
                      Confirme a compatibilidade e os requisitos antes da publicação.
                    </span>
                  </div>
                </div>

                {/* 3. Imagens do produto */}
                <div className={styles.formCard}>
                  <h3 className={styles.cardTitleH3}>Imagens do produto</h3>

                  <div className={styles.dropzone}>
                    <ImagePlus size={36} className={styles.dropzoneIcon} />
                    <span className={styles.dropzoneTitle}>
                      Arraste suas imagens aqui
                    </span>
                    <span className={styles.dropzoneNote}>
                      JPG ou PNG · Até 5 MB por arquivo
                    </span>
                    <button type="button" className={styles.selectFilesBtn}>
                      Selecionar arquivos
                    </button>
                  </div>

                  <div className={styles.uploadedFileList}>
                    <div className={styles.uploadedFileItem}>
                      <div className={styles.uploadedFileLeft}>
                        <Image
                          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop"
                          alt="Prévia Neon Drift"
                          width={44}
                          height={32}
                          className={styles.uploadedFileThumb}
                        />
                        <div className={styles.uploadedFileInfo}>
                          <span className={styles.uploadedFileName}>
                            neon-drift-capa.jpg
                          </span>
                          <span className={styles.uploadedFileMeta}>
                            Imagem principal · 1,8 MB · Exemplo
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.deleteFileBtn}
                        aria-label="Remover imagem"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barra de Ações */}
                <div className={styles.formActionBar}>
                  <button
                    type="button"
                    className={styles.cancelActionBtn}
                    onClick={() => setActiveSection("overview")}
                  >
                    Cancelar
                  </button>

                  <div className={styles.actionRightButtons}>
                    <button
                      type="button"
                      className={styles.draftActionBtn}
                      onClick={() => handleSave("Rascunho salvo com sucesso!")}
                    >
                      <Save size={16} />
                      <span>Salvar rascunho</span>
                    </button>

                    <button
                      type="button"
                      className={styles.publishActionBtn}
                      onClick={() => handleSave("Jogo cadastrado com sucesso!")}
                    >
                      <Plus size={16} />
                      <span>Cadastrar jogo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Prévia do Card e Checklist */}
              <div className={styles.previewColumn}>
                {/* Prévia do Card */}
                <div className={styles.previewWrapperCard}>
                  <h3 className={styles.previewHeaderTitle}>Prévia do card</h3>
                  <span className={styles.previewHeaderNote}>
                    Assim o jogo aparecerá no catálogo
                  </span>

                  <div className={styles.livePreviewCard}>
                    <div className={styles.livePreviewBanner}>
                      <Image
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"
                        alt={gameTitle}
                        fill
                        className={styles.livePreviewImg}
                      />
                      <span className={styles.livePreviewTagNeon}>
                        {gameTitle.toUpperCase()}
                      </span>
                      <span className={styles.livePreviewPlatform}>
                        {gamePlatform.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.livePreviewBody}>
                      <span className={styles.livePreviewCategory}>
                        {gameCategory}
                      </span>
                      <h4 className={styles.livePreviewTitle}>{gameTitle}</h4>
                      <span className={styles.livePreviewSub}>Chave digital</span>

                      <div className={styles.livePreviewPriceRow}>
                        <span className={styles.livePreviewPrice}>{gamePrice}</span>
                        <div className={styles.livePreviewCartBtn}>
                          <ShoppingCart size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className={styles.notPublishedBadge}>NÃO PUBLICADO</span>
                </div>

                {/* Checklist de Publicação */}
                <div className={styles.checklistCard}>
                  <Info size={22} className={styles.checklistIcon} />
                  <div className={styles.checklistBody}>
                    <h4 className={styles.checklistTitle}>
                      Checklist de publicação
                    </h4>
                    <p className={styles.checklistText}>
                      Revise descrição, preço, região, compatibilidade e imagens.
                      Cadastre as chaves no estoque antes de disponibilizar a venda.
                    </p>
                  </div>
                </div>

                <p className={styles.previewDisclaimer}>
                  {gameTitle} e sua desenvolvedora são exemplos fictícios. Nenhum
                  produto foi cadastrado.
                </p>
              </div>
            </div>

            <p className={styles.adminFooterDisclaimer}>
              Dados demonstrativos · Atualizado em 05/10/2026 às 14:32
            </p>
          </div>
        )}

        {/* ========================================================
            SEÇÃO 3: PEDIDOS DO ADMIN
            ======================================================== */}
        {activeSection === "orders" && (
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
        )}
      </div>
    </div>
  );
}
