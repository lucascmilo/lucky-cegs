import { useEffect } from "react";

// === Seção: Aviso antes de sair com alterações não salvas ===
// Enquanto alguma tela tiver algo sem salvar, fechar a aba, recarregar ou clicar num link do site pede confirmação.
// Várias partes da tela podem usar ao mesmo tempo: o aviso aparece uma vez só.

const MENSAGEM = "Você tem alterações que ainda não foram salvas. Sair mesmo assim?";
const pendentes = new Set<symbol>();

function aoFecharAba(evento: BeforeUnloadEvent) {
  evento.preventDefault();
}

// Links do próprio site navegam sem recarregar: o clique é conferido antes de chegar ao Next
function aoClicar(evento: MouseEvent) {
  if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;
  const link = (evento.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
  const destino = new URL(link.href, window.location.href);
  if (destino.origin !== window.location.origin) return;
  if (destino.pathname === window.location.pathname && destino.search === window.location.search) return;
  if (window.confirm(MENSAGEM)) return;
  evento.preventDefault();
  evento.stopPropagation();
}

export function useAvisoAoSair(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const chave = Symbol();
    if (pendentes.size === 0) {
      window.addEventListener("beforeunload", aoFecharAba);
      document.addEventListener("click", aoClicar, true);
    }
    pendentes.add(chave);
    return () => {
      pendentes.delete(chave);
      if (pendentes.size === 0) {
        window.removeEventListener("beforeunload", aoFecharAba);
        document.removeEventListener("click", aoClicar, true);
      }
    };
  }, [ativo]);
}
