"use client";

import Link from "next/link";
import { useEffect } from "react";
import CartaoAviso from "@/componentes/CartaoAviso";
import mosaicoPixels from "@/public/imagens/mosaico-pixels.png";
import posterHalftone from "@/public/imagens/poster-halftone.png";

// === Seção: Tela de erro das páginas do site ===
export default function ErroSite({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <CartaoAviso
      etiqueta="EXTRAVIADO NO CAMINHO"
      tituloPreto="ALGO DEU"
      tituloRosa="ERRADO"
      cursiva="foi mal, a página se perdeu…"
      texto="Não conseguimos carregar esta página agora. Tente de novo em alguns segundos; se continuar, avise a GOM."
      peca={posterHalftone}
      imagemSelo={mosaicoPixels}
    >
      <button type="button" className="botao botao__rosa" onClick={retry}>
        Tentar de novo
      </button>
      <Link href="/" className="botao botao__contorno">
        Voltar para o início
      </Link>
    </CartaoAviso>
  );
}