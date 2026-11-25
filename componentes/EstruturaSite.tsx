import type { ReactNode } from "react";
import AvisoConexao from "./AvisoConexao";
import BarraSuperior from "./BarraSuperior";
import Cabecalho from "./Cabecalho";
import Rodape from "./Rodape";
import TransicaoPagina from "./TransicaoPagina";

// === Seção: Estrutura comum às páginas do site ===
// Usada pelo layout do site e pela página de erro 404.
export default function EstruturaSite({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="pularConteudo">
        Pular para o conteúdo
      </a>

      {/* === Seção: Topo === */}
      <BarraSuperior />
      <Cabecalho />

      {/* === Seção: Conteúdo da página === */}
      <main id="conteudo" className="layoutSite__principal" tabIndex={-1}>
        <TransicaoPagina>{children}</TransicaoPagina>
      </main>

      {/* === Seção: Rodapé === */}
      <Rodape />

      <AvisoConexao />
    </>
  );
}