'use client'
import Form from "next/form";
import { Search, ChevronLeft } from "lucide-react";
import styles from "./Header.module.css";
import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Logo } from "./Logo";
import { OnNavigate } from "./OnNavigate";
import { SidebarButton } from "./sidebar/Sidebar";
import { useSidebar } from "./sidebar/SidebarContext";

const SEARCH_ID = "header-search";

export function HeaderContent({ userButtons }: { userButtons: ReactNode }) {
  const sidebar = useSidebar()
  // Mobile: o sidebar cobre a Header, então nada dela pode receber foco por baixo dele.
  const covered = sidebar.isOpen && sidebar.isMobile
  const [isOpen, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)

  // A busca fecha em qualquer navegação. O usePathname fica no OnNavigate, dentro de um <Suspense>,
  // para a Header não suspender em rotas dinâmicas como /products/[id].
  const closeOnNavigate = useCallback(() => setOpen(false), [])

  // Os itens atrás da busca ficam inert, então ela não pode continuar aberta no desktop.
  // Usa o mesmo isMobile do sidebar para os dois nunca discordarem do breakpoint.
  if (isOpen && !sidebar.isMobile) {
    setOpen(false)
  }

  // O input só pode receber foco depois de sair do display: none, e o iOS só abre
  // o teclado se o focus() acontecer durante o clique. Por isso o flushSync.
  function openSearch() {
    flushSync(() => setOpen(true))
    inputRef.current?.focus()
  }

  function closeSearch() {
    flushSync(() => setOpen(false))
    openButtonRef.current?.focus()
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Escape" || !isOpen) return
    // Marca o Esc como tratado: o SidebarProvider ignora e o sidebar mobile continua aberto.
    event.preventDefault()
    closeSearch()
  }

  return (
    <>
      <OnNavigate onNavigate={closeOnNavigate} />
      <div
        className={`${styles.wrapperLeft} ${sidebar.isOpen ? styles.wrapperLeftOpen : ''}`}
        inert={isOpen || covered}
      >
        <SidebarButton ref={sidebar.triggerRef} />
        <Logo />
      </div>

      <Form
        action="/catalog"
        role="search"
        id={SEARCH_ID}
        className={`${styles.searchBar} ${isOpen ? styles.searchBarOpen : ''}`}
        onKeyDown={handleSearchKeyDown}
        onSubmit={() => setOpen(false)}
      >
        <button type="button" className={styles.searchToggle} aria-label="Voltar"
          onClick={closeSearch}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.searchField}>
          <Search className={styles.searchIcon} size={20}/>
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Buscar jogos, desenvolvedoras..."
            aria-label="Buscar jogos e desenvolvedoras"
            autoComplete="off"
            enterKeyHint="search"
            className={styles.searchInput}
          />
        </div>
      </Form>

      <div className={styles.wrapperRight} inert={isOpen || covered}>
        <button ref={openButtonRef} type="button" className={styles.searchButton} aria-label="Abrir Busca"
          aria-expanded={isOpen} aria-controls={SEARCH_ID} onClick={openSearch}>
          <Search size={20} />
        </button>
        {userButtons}
      </div>
    </>
  );
}
