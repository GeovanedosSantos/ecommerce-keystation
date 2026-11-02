'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { OnNavigate } from "../OnNavigate";
import { Sidebar } from "./Sidebar";
import styles from "./Sidebar.module.css";
import { SIDEBAR_ID, SidebarContext } from "./SidebarContext";

// Mesmo breakpoint do Sidebar.module.css e do Header.module.css (max-width: 768px).
const MOBILE_QUERY = "(max-width: 768px)";

function subscribeMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

export function SidebarProvider({ header, children }: { header: ReactNode, children: ReactNode }) {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
  const [isOpen, setOpen] = useState(false)
  const [lastIsMobile, setLastIsMobile] = useState(isMobile)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(isOpen)

  // Ao trocar de desktop para mobile (ou o inverso) o sidebar começa fechado,
  // para não aparecer um overlay que ninguém pediu.
  if (isMobile !== lastIsMobile) {
    setLastIsMobile(isMobile)
    setOpen(false)
  }

  const toggle = useCallback(() => setOpen(open => !open), [])
  const close = useCallback(() => setOpen(false), [])

  // No mobile o overlay fecha em qualquer navegação: links da Header, botão Voltar do navegador etc.
  // No desktop ele continua aberto entre as páginas.
  const closeOnMobile = useCallback(() => {
    if (isMobile) setOpen(false)
  }, [isMobile])

  // Esc só fecha o overlay do mobile. No desktop o sidebar não é modal.
  // A busca da Header marca o Esc dela com preventDefault, para não fechar os dois juntos.
  useEffect(() => {
    if (!isOpen || !isMobile) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return
      setOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isMobile])

  // Foco ao abrir e fechar. Layout effect para rodar antes do navegador tirar o foco de algo que virou inert.
  useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = isOpen
    if (wasOpen === isOpen) return

    // Mobile: o overlay cobre a Header e ela fica inert, então o foco entra no botão do topo do sidebar.
    if (isOpen) {
      if (isMobile) closeButtonRef.current?.focus({ preventScroll: true })
      return
    }

    // Ao fechar, o sidebar fica inert. Se o foco estava dentro dele (ou se perdeu no <body>, como ao
    // tocar no fundo escuro), devolve para o botão da Header.
    const active = document.activeElement
    if (active === document.body || document.getElementById(SIDEBAR_ID)?.contains(active)) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen, isMobile])

  // Mobile é overlay: trava a rolagem da página enquanto ele estiver aberto.
  // Precisa ser no <html>, não no <body>: como o html tem overflow-x: clip (globals.css), o overflow
  // do body não passa para a janela. O body viraria um container de rolagem próprio, a rolagem não
  // travaria e a Header (sticky) deixaria de grudar no topo.
  useEffect(() => {
    if (!isMobile || !isOpen) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => { root.style.overflow = previous }
  }, [isMobile, isOpen])

  const value = useMemo(
    () => ({ isOpen, isMobile, toggle, close, triggerRef, closeButtonRef }),
    [isOpen, isMobile, toggle, close],
  )

  return (
    <SidebarContext value={value}>
      <OnNavigate onNavigate={closeOnMobile} />
      {header}
      <div className={styles.shell}>
        <Sidebar />
        {/* No mobile o overlay cobre a página e a Header: o que está atrás dele não pode receber foco.
            A Header fica inert pelo próprio HeaderContent (covered), sem um wrapper que quebraria o sticky dela. */}
        <div className={styles.content} inert={isOpen && isMobile}>
          {children}
        </div>
      </div>
    </SidebarContext>
  )
}
