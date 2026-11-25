"use client";

import { useEffect, useState, ViewTransition, type ReactNode } from "react";

// === Seção: Transição entre páginas ===
// Ao trocar o conteúdo (página, filtro ou fim do carregamento), o antigo esmaece e o novo sobe de leve.
// Quando a aba está oculta, evita iniciar a ViewTransition para não disparar InvalidStateError ("Document hidden").
export default function TransicaoPagina({ children }: { children: ReactNode }) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    function atualizarVisibilidade() {
      setVisivel(document.visibilityState === "visible");
    }

    atualizarVisibilidade();
    document.addEventListener("visibilitychange", atualizarVisibilidade);
    return () => document.removeEventListener("visibilitychange", atualizarVisibilidade);
  }, []);

  if (!visivel) {
    return <>{children}</>;
  }

  return <ViewTransition default="pagina-troca">{children}</ViewTransition>;
}