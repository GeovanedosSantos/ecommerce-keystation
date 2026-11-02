'use client'
import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Com cacheComponents, o usePathname suspende em rotas com parâmetro dinâmico sem generateStaticParams
// (ex.: /products/[id]) e precisa ficar dentro de um <Suspense>. Por isso ele fica isolado aqui:
// só este componente espera, e não a Header, o sidebar ou o app inteiro.
function PathnameWatcher({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const lastPathnameRef = useRef(pathname)

  useEffect(() => {
    if (pathname === lastPathnameRef.current) return
    lastPathnameRef.current = pathname
    onNavigate()
  }, [pathname, onNavigate])

  return null
}

// Chama onNavigate sempre que a rota muda (links, botão Voltar do navegador etc.).
export function OnNavigate({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Suspense fallback={null}>
      <PathnameWatcher onNavigate={onNavigate} />
    </Suspense>
  )
}
