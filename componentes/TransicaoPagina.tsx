import { ViewTransition, type ReactNode } from "react";

// === Seção: Transição entre páginas ===
// Ao trocar o conteúdo (página, filtro ou fim do carregamento), o antigo esmaece e o novo sobe de leve.
export default function TransicaoPagina({ children }: { children: ReactNode }) {
  return <ViewTransition default="pagina-troca">{children}</ViewTransition>;
}
