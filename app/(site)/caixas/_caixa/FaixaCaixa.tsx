import Image from "next/image";
import Link from "next/link";
import type { CaixaAberta, DetalheCaixa } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import { ETAPAS_CAIXA, obterEtapaCaixa } from "@/lib/etapas";
import { nomeOrigem } from "@/lib/formatacao";
import trevoFoto from "@/public/imagens/adesivo-trevo-foto.png";
import fotoCaixas from "@/public/imagens/caixas-joiner-photocard.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import coracaoBranco from "@/public/imagens/coracao-branco.svg";
import NomeCaixa from "./NomeCaixa";

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
          <NomeCaixa nome={caixa.nome} />
          {origem && <span className="caixaTopo__origem">{origem.toLowerCase()}</span>}
        </h1>

        {/* === Seção: Etapas da caixa === */}
        <ol
          className="caixaTopo__etapas"
          aria-label={`Etapa ${etapaAtual.numero} de ${ETAPAS_CAIXA.length}: ${etapaAtual.rotulo}`}
        >
          {ETAPAS_CAIXA.map((etapa, indice) => {
            const concluida = indice < etapaAtual.numero;
            const atual = indice + 1 === etapaAtual.numero;
            return (
              <li
                key={etapa.id}
                className={juntarClasses("caixaTopo__etapa", concluida && "caixaTopo__etapaConcluida")}
              >
                <span className="caixaTopo__barra" aria-hidden="true" />
                <span aria-current={atual ? "step" : undefined}>{etapa.rotulo}</span>
              </li>
            );
          })}
        </ol>

        {/* === Seção: Outras caixas abertas === */}
        {caixasAbertas.length > 0 && (
          <nav className="caixaTopo__caixas" aria-label="Caixas abertas">
            {caixasAbertas.map((aberta) => {
              const ativa = aberta.id === caixa.id;
              return (
                <Link
                  key={aberta.id}
                  href={`/caixas/${aberta.id}`}
                  className={juntarClasses("pilulaSelecao", ativa && "pilulaSelecao__ativa")}
                  aria-current={ativa ? "page" : undefined}
                >
                  {aberta.nome}
                </Link>
              );
            })}
          </nav>
        )}

        {/* === Seção: Colagem === */}
        <div className="caixaTopo__colagem" aria-hidden="true">
          <span className="caixaTopo__quadrado" />
          <Image src={fotoCaixas} alt="" sizes="190px" className="caixaTopo__foto" priority />
          <Image src={codigoBarras} alt="" sizes="160px" className="caixaTopo__codigoBarras" />
          <Image src={coracaoBranco} alt="" width={40} height={40} className="caixaTopo__coracao" />
          <Image src={trevoFoto} alt="" sizes="90px" className="caixaTopo__adesivoTrevo" />
        </div>
      </div>
    </section>
  );
}