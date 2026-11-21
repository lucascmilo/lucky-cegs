"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

// === Seção: Transição entre páginas ===
// A chave pelo endereço faz a página antiga sair (esmaecendo) e a nova entrar (subindo de leve).
export default function TransicaoPagina({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  return (
    <ViewTransition key={caminho} enter="pagina-entra" exit="pagina-sai" default="none">
      {children}
    </ViewTransition>
  );
}
