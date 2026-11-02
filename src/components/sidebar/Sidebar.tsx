'use client'
import Link from "next/link";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { Menu, KeyRound, LayoutGrid, Vault, LifeBuoy, type LucideIcon } from "lucide-react";
import styles from "./Sidebar.module.css";
import { SIDEBAR_ID, useSidebar } from "./SidebarContext";

const NAV_LINKS: { href: string, label: string, icon: LucideIcon }[] = [
  { href: "/catalog", label: "Catálogo", icon: LayoutGrid },
  { href: "/account/vault", label: "Cofre", icon: Vault },
  { href: "/support", label: "Suporte", icon: LifeBuoy },
]

// Desktop: o botão e o logo ficam na Header (HeaderContent.tsx) e já caem dentro da área do sidebar.
// Mobile: o sidebar cobre a Header, então o topo dele (.top) traz o seu próprio botão e logo,
// no mesmo lugar dos da Header.
export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, isMobile, close, toggle, closeButtonRef } = useSidebar()

  // No mobile o overlay fecha ao navegar. No desktop ele fica aberto.
  function handleNavigate() {
    if (isMobile) close()
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        id={SIDEBAR_ID}
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Barra lateral"
        inert={!isOpen}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <button ref={closeButtonRef} type="button" className={styles.toggle}
              aria-label="Fechar Barra Lateral" onClick={toggle}>
              <Menu size={20} />
            </button>
            <Link href="/" className={styles.logo} aria-label="Keystation" onClick={handleNavigate}>
              <KeyRound className={styles.logoIcon} />
              <span>Keystation</span>
            </Link>
          </div>

          <nav aria-label="Navegação principal">
            <ul className={styles.list}>
              {NAV_LINKS.map(({ href, label, icon: Icon }, index) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <li key={href} style={{ '--i': index } as CSSProperties}>
                    <Link
                      href={href}
                      className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={handleNavigate}
                    >
                      <Icon size={20} className={styles.linkIcon} />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
