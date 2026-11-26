"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  LayoutDashboard,
  Gamepad2,
  ReceiptText,
  Settings,
  ArrowLeft,
} from "lucide-react";
import styles from "./admin.module.css";

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith("/admin/games")) {
    return "Jogos";
  }
  if (pathname.startsWith("/admin/orders")) {
    return "Pedidos";
  }
  return "Visão geral";
}

export function AdminShell({
  children,
  adminLabel = "Administrador",
}: {
  children: ReactNode;
  adminLabel?: string;
}) {
  const pathname = usePathname();
  const isOverview = pathname === "/admin";
  const isGames = pathname.startsWith("/admin/games");
  const isOrders = pathname.startsWith("/admin/orders");

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
            <Link
              href="/admin"
              className={`${styles.navItem} ${
                isOverview ? styles.navItemActive : ""
              }`}
              aria-current={isOverview ? "page" : undefined}
            >
              <LayoutDashboard size={18} />
              <span>Visão geral</span>
            </Link>

            {/* 2. Jogos */}
            <Link
              href="/admin/games"
              className={`${styles.navItem} ${
                isGames ? styles.navItemActive : ""
              }`}
              aria-current={isGames ? "page" : undefined}
            >
              <Gamepad2 size={18} />
              <span>Jogos</span>
            </Link>

            {/* 3. Pedidos */}
            <Link
              href="/admin/orders"
              className={`${styles.navItem} ${
                isOrders ? styles.navItemActive : ""
              }`}
              aria-current={isOrders ? "page" : undefined}
            >
              <ReceiptText size={18} />
              <span>Pedidos</span>
            </Link>
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
        <header className={styles.topBar}>
          <nav aria-label="Navegação estrutural" className={styles.breadcrumb}>
            <span>KeyStation</span>
            <span>/</span>
            <span>Administração</span>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>
              {getSectionLabel(pathname)}
            </span>
          </nav>

          <span className={styles.adminBadge}>{adminLabel}</span>
        </header>

        {children}
      </div>
    </div>
  );
}
