import Image from "next/image";
import Link from "next/link";
import type { CaixaAberta, DetalheCaixa } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import { ETAPAS_CAIXA, obterEtapaCaixa } from "@/lib/etapas";
import { nomeOrigem } from "@/lib/formatacao";
import brilhoAmarelo from "@/public/imagens/brilho-amarelo.png";
import fotoCaixas from "@/public/imagens/caixas-foto.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import coracaoBranco from "@/public/imagens/coracao-branco.png";

type PropsFaixaCaixa = {
  caixa: DetalheCaixa;
  caixasAbertas: CaixaAberta[];
};

// === Seção: Faixa azul do topo ===
export default function FaixaCaixa({ caixa, caixasAbertas }: PropsFaixaCaixa) {
  const etapaAtual = obterEtapaCaixa(caixa.situacao);
  const origem = nomeOrigem(caixa.origem);

  return (
    <section className="caixaTopo">
      <div className="caixaTopo__conteudo">
        {/* === Seção: Nome e origem === */}
        <h1 className="caixaTopo__titulo">
          {caixa.nome}
          {origem && <span className="caixaTopo__origem">{origem.toLowerCase()}</span>}
        </h1>

        {/* === Seção: Etapas da caixa === */}
        <ol className="caixaTopo__etapas" aria-label={`Etapa ${etapaAtual.numero} de ${ETAPAS_CAIXA.length}`}>
          {ETAPAS_CAIXA.map((etapa, indice) => {
            const concluida = indice < etapaAtual.numero;
            return (
              <li key={etapa.id} className={juntarClasses("caixaTopo__etapa", concluida && "caixaTopo__etapaConcluida")}>
                <span className="caixaTopo__barra" aria-hidden="true" />
                <span aria-current={indice + 1 === etapaAtual.numero ? "step" : undefined}>{etapa.rotulo}</span>
              </li>
            );
          })}
        </ol>

        {/* === Seção: Outras caixas abertas === */}
        <nav className="caixaTopo__caixas" aria-label="Caixas abertas">
          {caixasAbertas.map((aberta) => (
            <Link
              key={aberta.id}
              href={`/caixas/${aberta.id}`}
              className={juntarClasses("pilulaSelecao", aberta.id === caixa.id && "pilulaSelecao__ativa")}
              aria-current={aberta.id === caixa.id ? "page" : undefined}
            >
              {aberta.nome}
            </Link>
          ))}
        </nav>

        {/* === Seção: Colagem === */}
        <div className="caixaTopo__colagem" aria-hidden="true">
          <span className="caixaTopo__quadrado" />
          <Image src={fotoCaixas} alt="" sizes="190px" className="caixaTopo__foto" priority />
          <Image src={codigoBarras} alt="" sizes="160px" className="caixaTopo__codigoBarras" />
          <Image src={brilhoAmarelo} alt="" className="caixaTopo__brilho" />
          <Image src={coracaoBranco} alt="" className="caixaTopo__coracao" />
        </div>
      </div>
    </section>
  );
}
