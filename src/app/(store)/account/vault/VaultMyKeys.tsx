"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  ScrollText,
  KeyRound,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Headphones,
  Lock,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { VAULT_KEYS, type VaultKey } from "@/utils/mock/vault";
import styles from "./vault.module.css";

type TabFilter = "all" | "hidden" | "revealed";

interface VaultKeyCardProps {
  item: VaultKey;
  onReveal?: (id: string) => void;
}

function VaultKeyCard({ item, onReveal }: VaultKeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(item.initialRevealed ?? false);
  const [copied, setCopied] = useState(false);

  function handleReveal() {
    setIsRevealed(true);
    if (onReveal) {
      onReveal(item.id);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  return (
    <div className={styles.gameCard}>
      {/* Banner Superior com Badges */}
      <div className={styles.cardBanner}>
        <Image
          src={item.coverImage}
          alt={item.gameTitle}
          fill
          sizes="(max-width: 960px) 100vw, 50vw"
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay} />

        {isRevealed ? (
          <span className={styles.badgeRevealed}>
            CHAVE REVELADA
          </span>
        ) : (
          <span className={styles.badgeProtected}>
            <span className={styles.badgeProtectedDot} />
            CHAVE PROTEGIDA
          </span>
        )}

        <span className={styles.badgePlatform}>
          {item.platform}
        </span>
      </div>

      {/* Conteúdo do Card */}
      <div className={styles.cardBody}>
        <div className={styles.gameHeader}>
          <h3 className={styles.gameTitle}>{item.gameTitle}</h3>
          <div className={styles.gameMeta}>
            <div>
              Comprado em {item.purchaseDate} · Pedido {item.orderNumber}
            </div>
            <div>
              Plataforma: {item.platform} · Região: {item.region}
            </div>
          </div>
        </div>

        {/* Seção da Chave */}
        <div className={styles.keySection}>
          <span className={styles.keyLabel}>
            {isRevealed ? "CÓDIGO DE ATIVAÇÃO" : "SUA CHAVE ESTÁ OCULTA"}
          </span>

          {isRevealed ? (
            <div className={styles.keyBoxRevealed}>
              <span className={styles.revealedCode}>{item.key}</span>
            </div>
          ) : (
            <div className={styles.keyBoxHidden}>
              <Lock size={16} />
              <span className={styles.hiddenDots}>•••••-•••••-•••••</span>
            </div>
          )}

          {/* Botão de Ação */}
          {isRevealed ? (
            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopy}
                aria-label={`Copiar chave de ${item.gameTitle}`}
              >
                <Copy size={16} />
                <span>Copiar</span>
              </button>

              {copied && (
                <span className={styles.copyFeedback} role="status">
                  <Check size={16} />
                  <span>Copiado!</span>
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.revealBtn}
              onClick={handleReveal}
              aria-label={`Revelar chave de ${item.gameTitle}`}
            >
              <Eye size={18} />
              <span>Revelar Chave</span>
            </button>
          )}

          <p className={styles.keyNote}>
            {isRevealed
              ? "Chave demonstrativa e não ativável. Feedback de cópia ilustrativo."
              : "Revele somente quando for ativar o jogo. Não compartilhe o código."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function VaultMyKeys() {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    VAULT_KEYS.forEach((k) => {
      if (k.initialRevealed) initial.add(k.id);
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  function handleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  const totalKeys = VAULT_KEYS.length;
  const revealedCount = revealedIds.size;
  const hiddenCount = totalKeys - revealedCount;

  const filteredKeys = VAULT_KEYS.filter((key) => {
    const isRevealed = revealedIds.has(key.id);
    if (activeTab === "hidden") return !isRevealed;
    if (activeTab === "revealed") return isRevealed;
    return true;
  });

  return (
    <PageContainer>
      <div className={styles.vaultPage}>
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className={styles.breadcrumb}>
          <Link href="/">Início</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/account">Minha conta</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Minhas Chaves</span>
        </nav>

        {/* Badge e Cabeçalho */}
        <div className={styles.headerBlock}>
          <span className={styles.badgeTop}>SEU COFRE DIGITAL</span>
          <h1 className={styles.title}>Minhas Chaves</h1>
          <p className={styles.subtitle}>
            Seus jogos, protegidos e prontos para a próxima aventura.
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

              <Link href="/account/orders" className={styles.navItem}>
                <ScrollText size={18} />
                <span>Meus Pedidos</span>
              </Link>

              <Link
                href="/account/vault"
                className={`${styles.navItem} ${styles.navItemActive}`}
              >
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

          {/* Coluna da Direita: Painel do Cofre */}
          <main className={styles.mainPanel}>
            {/* Linha de Estatísticas */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalKeys}</span>
                <span className={styles.statLabel}>Jogos adquiridos</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statValue}>{hiddenCount}</span>
                <span className={styles.statLabel}>
                  {hiddenCount === 1 ? "Chave oculta" : "Chaves ocultas"}
                </span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statValue}>{revealedCount}</span>
                <span className={styles.statLabel}>
                  {revealedCount === 1 ? "Chave revelada" : "Chaves reveladas"}
                </span>
              </div>
            </div>

            {/* Card de Aviso / Antes de Revelar */}
            <div className={styles.alertCard}>
              <ShieldCheck size={22} className={styles.alertIcon} />
              <div className={styles.alertBody}>
                <h3 className={styles.alertTitle}>Antes de revelar sua chave</h3>
                <p className={styles.alertText}>
                  Confira a conta Steam e a região de ativação. Visualizar ou ativar
                  um código pode afetar a análise de devolução, sem eliminar
                  automaticamente seus direitos legais.
                </p>
              </div>
            </div>

            {/* Barra de Filtros e Link do Guia da Steam */}
            <div className={styles.filterBar}>
              <div className={styles.filterTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "all"}
                  className={`${styles.filterTab} ${
                    activeTab === "all" ? styles.filterTabActive : ""
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  Todos ({totalKeys})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "hidden"}
                  className={`${styles.filterTab} ${
                    activeTab === "hidden" ? styles.filterTabActive : ""
                  }`}
                  onClick={() => setActiveTab("hidden")}
                >
                  Ocultas ({hiddenCount})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "revealed"}
                  className={`${styles.filterTab} ${
                    activeTab === "revealed" ? styles.filterTabActive : ""
                  }`}
                  onClick={() => setActiveTab("revealed")}
                >
                  Reveladas ({revealedCount})
                </button>
              </div>

              <Link href="/help/steam-guide" className={styles.steamGuideLink}>
                <span>Como ativar na Steam</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Grid dos Cards de Jogos */}
            <div className={styles.keysGrid}>
              {filteredKeys.map((item) => (
                <VaultKeyCard
                  key={item.id}
                  item={item}
                  onReveal={handleReveal}
                />
              ))}
            </div>

            {/* Card de Suporte / Problema na Ativação */}
            <div className={styles.supportCard}>
              <div className={styles.supportLeft}>
                <h4 className={styles.supportTitle}>Problema com a ativação?</h4>
                <p className={styles.supportDesc}>
                  Envie o número do pedido e a mensagem de erro, sem expor a chave.
                </p>
              </div>

              <Link href="/support" className={styles.supportBtn}>
                <Headphones size={18} />
                <span>Falar com o suporte</span>
              </Link>
            </div>

            {/* Rodapé Informativo */}
            <p className={styles.footerDisclaimer}>
              Inventário demonstrativo · As duas chaves pertencem ao pedido #12345.
            </p>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
