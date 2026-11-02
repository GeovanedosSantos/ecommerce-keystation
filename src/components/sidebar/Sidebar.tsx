'use client'
import Link from "next/link";
import { Suspense, type CSSProperties, type Ref } from "react";
import { usePathname } from "next/navigation";
import { Menu, LayoutGrid, Vault, LifeBuoy, type LucideIcon } from "lucide-react";
import { Logo } from "../Logo";
import styles from "./Sidebar.module.css";
import { SIDEBAR_ID, useSidebar } from "./SidebarContext";

const NAV_LINKS: { href: string, label: string, icon: LucideIcon }[] = [
  { href: "/catalog", label: "Catálogo", icon: LayoutGrid },
  { href: "/account/vault", label: "Cofre", icon: Vault },
  { href: "/support", label: "Suporte", icon: LifeBuoy },
]

// Botão que abre e fecha o sidebar. Exportado para a Header (HeaderContent.tsx) e usado também no topo
// do overlay mobile, que cobre a Header. Os dois controlam o mesmo sidebar, então mostram o mesmo rótulo e estado.
export function SidebarButton({ ref }: { ref?: Ref<HTMLButtonElement> }) {
  const { isOpen, toggle } = useSidebar()

  return (
    <button ref={ref} type="button" className={styles.sidebarButton}
      aria-label={isOpen ? "Fechar Barra Lateral" : "Abrir Barra Lateral"}
      aria-expanded={isOpen} aria-controls={SIDEBAR_ID} onClick={toggle}>
      <Menu size={20} />
    </button>
  )
}

// pathname null = ainda não resolvido: a lista aparece sem nenhum link ativo.
function NavList({ pathname, onNavigate }: { pathname: string | null, onNavigate: () => void }) {
  return (
    <ul className={styles.list}>
      {NAV_LINKS.map(({ href, label, icon: Icon }, index) => {
        const isActive = pathname !== null && (pathname === href || pathname.startsWith(`${href}/`))
        return (
          <li key={href} style={{ '--i': index } as CSSProperties}>
            <Link
              href={href}
              className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon size={20} className={styles.linkIcon} />
              <span>{label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

// Com cacheComponents, o usePathname suspende em rotas dinâmicas como /products/[id].
// Fica isolado aqui, dentro de um <Suspense>, para só o destaque do link ativo esperar.
function ActiveNavList({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  return <NavList pathname={pathname} onNavigate={onNavigate} />
}

// Desktop: coluna abaixo da Header que empurra o conteúdo. O botão e o logo são os da Header.
// Mobile: overlay que cobre a Header. O topo dele (.top) repete o SidebarButton e o Logo, os mesmos
// componentes da Header, no mesmo lugar e com as mesmas medidas.
export function Sidebar() {
  const { isOpen, isMobile, close, closeButtonRef } = useSidebar()

  // No mobile o overlay fecha ao clicar em um link. Mudar de rota já fecha (SidebarProvider),
  // mas clicar no link da página atual não muda a rota.
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
            <SidebarButton ref={closeButtonRef} />
            <Logo onClick={handleNavigate} />
          </div>

          <nav aria-label="Navegação principal">
            <Suspense fallback={<NavList pathname={null} onNavigate={handleNavigate} />}>
              <ActiveNavList onNavigate={handleNavigate} />
            </Suspense>
          </nav>
        </div>
      </aside>
    </>
  )
}
