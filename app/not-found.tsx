import type { Metadata } from "next";
import Link from "next/link";
import CartaoAviso from "@/componentes/CartaoAviso";
import EstruturaSite from "@/componentes/EstruturaSite";
import capaRiso from "@/public/imagens/capa-riso.png";
import mosaicoPixels from "@/public/imagens/mosaico-pixels.png";

export const metadata: Metadata = {
  title: "Página não encontrada · Lucky Cegs",
};

// === Seção: Página não encontrada (404) ===
export default function PaginaNaoEncontrada() {
  return (
    <EstruturaSite>
      <CartaoAviso
        etiqueta="DEVOLVIDO AO REMETENTE"
        tituloPreto="PÁGINA NÃO"
        tituloRosa="ENCONTRADA"
        cursiva="ops, essa ainda não chegou…"
        texto="Essa página ainda não existe ou mudou de endereço. Enquanto isso, você pode voltar para o início."
        peca={capaRiso}
        imagemSelo={mosaicoPixels}
      >
        <Link href="/" className="botao botao__rosa">
          Voltar para o início
        </Link>
        <Link href="/termos" className="botao botao__contorno">
          Ler os termos
        </Link>
      </CartaoAviso>
    </EstruturaSite>
  );
}