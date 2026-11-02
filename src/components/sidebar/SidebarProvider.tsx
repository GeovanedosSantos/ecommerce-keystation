'use client'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import styles from "./Sidebar.module.css";
import { SidebarContext } from "./SidebarContext";

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
  const wasOpenRef = useRef(false)

  // Ao trocar de desktop para mobile (ou o inverso) o sidebar começa fechado,
  // para não aparecer um overlay que ninguém pediu.
  if (isMobile !== lastIsMobile) {
    setLastIsMobile(isMobile)
    setOpen(false)
  }

  const toggle = useCallback(() => setOpen(open => !open), [])
  const close = useCallback(() => setOpen(false), [])

  // Esc só fecha o overlay do mobile. No desktop o sidebar não é modal, e o Esc
  // também serve a outras coisas (fechar a busca, por exemplo).
  useEffect(() => {
    if (!isOpen || !isMobile) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isMobile])

  // Mobile: o overlay cobre a header, então o foco entra no botão do sidebar e volta para o da header.
  useEffect(() => {
    // Só quando o estado muda de fato, para não roubar o foco ao carregar a página.
    if (wasOpenRef.current === isOpen) return
    wasOpenRef.current = isOpen
    if (isMobile) (isOpen ? closeButtonRef : triggerRef).current?.focus({ preventScroll: true })
  }, [isMobile, isOpen])

  // Mobile é overlay: trava a rolagem da página enquanto ele estiver aberto.
  useEffect(() => {
    if (!isMobile || !isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isMobile, isOpen])

  const value = useMemo(
    () => ({ isOpen, isMobile, toggle, close, triggerRef, closeButtonRef }),
    [isOpen, isMobile, toggle, close],
  )

  return (
    <SidebarContext value={value}>
      {header}
      <div className={styles.shell}>
        <Sidebar />
        {/* No mobile o overlay cobre a página: o que está atrás não pode receber foco.
            A header fica de fora porque o botão dela é quem fecha o sidebar. */}
        <div className={styles.content} inert={isOpen && isMobile}>
          {children}
        </div>
      </div>
    </SidebarContext>
  )
}
