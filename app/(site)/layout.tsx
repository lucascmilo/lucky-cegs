import BarraSuperior from "@/componentes/BarraSuperior";
import Cabecalho from "@/componentes/Cabecalho";
import Rodape from "@/componentes/Rodape";

// === Seção: Layout das páginas do site (com barra, cabeçalho e rodapé) ===
export default function LayoutSite({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* === Seção: Topo === */}
      <BarraSuperior />
      <Cabecalho />

      {/* === Seção: Conteúdo da página === */}
      <main className="layoutSite__principal">{children}</main>

      {/* === Seção: Rodapé === */}
      <Rodape />
    </>
  );
}
