'use client'
import { createContext, useContext, type RefObject } from "react";

export const SIDEBAR_ID = "sidebar";

export type SidebarContextValue = {
  isOpen: boolean
  isMobile: boolean
  toggle: () => void
  close: () => void
  /** Botão da Header que abre e fecha o sidebar. Recebe o foco de volta quando o sidebar fecha com o foco dentro dele. */
  triggerRef: RefObject<HTMLButtonElement | null>
  /** Botão do topo do sidebar (só aparece no mobile, onde o overlay cobre a Header). Recebe o foco quando o overlay abre. */
  closeButtonRef: RefObject<HTMLButtonElement | null>
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar precisa estar dentro de <SidebarProvider>")
  return context
}
