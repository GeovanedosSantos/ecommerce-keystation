'use client'
import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, KeyRound, Menu, ChevronLeft } from "lucide-react";
import styles from "./Header.module.css";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

const SEARCH_ID = "header-search";

export function HeaderContent({ userButtons }: { userButtons: ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)
  const inputRef = useRef<HTMLInputElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)

  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  // Os itens atrás do overlay ficam inert, então ele não pode continuar aberto no desktop.
  useEffect(() => {
    // Mesmo breakpoint do Header.module.css (max-width: 768px).
    const desktop = window.matchMedia("(min-width: 769px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }

    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

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
    if (event.key === "Escape" && isOpen) closeSearch()
  }

  return (
    <>
      <div className={styles.wrapperLeft} inert={isOpen}>
        <button type="button" className={styles.sidebarButton} aria-label="Abrir Barra Lateral">
          <Menu size={20} />
        </button>
        <Link href="/" className={styles.logo} aria-label="Keystation">
          <KeyRound className={styles.logoIcon} />
          <span className={styles.logoText}>Keystation</span>
        </Link>
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

      <div className={styles.wrapperRight} inert={isOpen}>
        <button ref={openButtonRef} type="button" className={styles.searchButton} aria-label="Abrir Busca"
          aria-expanded={isOpen} aria-controls={SEARCH_ID} onClick={openSearch}>
          <Search size={20} />
        </button>
        {userButtons}
      </div>
    </>
  );
}
