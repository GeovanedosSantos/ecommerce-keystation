'use client'
import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type HideOnPathProps = { path: string; children: ReactNode };

function PathnameGate({ path, children }: HideOnPathProps) {
  return usePathname() === path ? null : children
}

/** O usePathname suspende em rotas dinâmicas; lá o fallback mostra o conteúdo, o certo fora de `path`. */
export function HideOnPath({ path, children }: HideOnPathProps) {
  return (
    <Suspense fallback={children}>
      <PathnameGate path={path}>{children}</PathnameGate>
    </Suspense>
  )
}
