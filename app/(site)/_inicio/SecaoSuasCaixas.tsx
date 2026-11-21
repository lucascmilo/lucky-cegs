import Image from "next/image";
import Link from "next/link";
import { IconeSeta } from "@/componentes/Icones";
import { ETAPAS_CAIXA, obterEtapaCaixa } from "@/lib/etapas";
import { formatarTempoRelativo } from "@/lib/formatacao";
import type { CaixaResumo } from "@/lib/joiner";
import carimboPostal from "@/public/imagens/carimbo-postal.png";

// null = caixas ainda carregando
export type ListaCaixas = CaixaResumo[] | null;

// === Seção: Suas caixas ===
export default function SecaoSuasCaixas({ caixas }: { caixas: ListaCaixas }) {
  return (
    <section className="inicioJoiner__faixa inicioJoiner__faixaQuadrados">
      <div className="inicioJoiner__cartao inicioJoiner__cartaoCaixas">
        <div className="inicioJoiner__topoCaixas">
          <h2 className="inicioJoiner__titulo">
            SUAS
            <span className="inicioJoiner__tituloRosa">CAIXAS</span>
          </h2>
          <Link href="/caixas" className="botao botao__preto inicioJoiner__botaoTodas">
            Todas as caixas
          </Link>
        </div>

        {caixas === null ? (
          <CaixasCarregando />
        ) : caixas.length > 0 ? (
          <ul className="inicioJoiner__listaCaixas">
            {caixas.map((caixa) => (
              <li key={caixa.id}>
                <CartaoCaixa caixa={caixa} />
              </li>
            ))}
          </ul>
        ) : (
          <SemCaixas />
        )}
      </div>
    </section>
  );
}

// === Seção: Cartão de uma caixa ===
function CartaoCaixa({ caixa }: { caixa: CaixaResumo }) {
  const etapa = obterEtapaCaixa(caixa.situacao);

  return (
    <Link href={`/caixas/${caixa.id}`} className="caixaResumo">
      <div className="caixaResumo__topo">
        <span className="caixaResumo__origem">{caixa.origem ?? "—"}</span>
        <span className="caixaResumo__tempo">{formatarTempoRelativo(caixa.situacaoAtualizadaEm)}</span>
      </div>

      <h3 className="caixaResumo__nome">{caixa.nome}</h3>

      <span className="caixaResumo__selo" style={{ backgroundColor: etapa.cor }}>
        {etapa.rotulo}
      </span>

      <div
        className="caixaResumo__progresso"
        role="img"
        aria-label={`Etapa ${etapa.numero} de ${ETAPAS_CAIXA.length}: ${etapa.rotulo}`}
      >
        {ETAPAS_CAIXA.map((item, indice) => (
          <span key={item.id} className={indice < etapa.numero ? "caixaResumo__barraCheia" : "caixaResumo__barra"} />
        ))}
      </div>

      <div className="caixaResumo__rodape">
        <span>
          <strong className="caixaResumo__seus">
            {caixa.seusItens} {caixa.seusItens === 1 ? "seu" : "seus"}
          </strong>{" "}
          de {caixa.totalItens} itens
        </span>
        <IconeSeta />
      </div>
    </Link>
  );
}

// === Seção: Aviso quando o joiner ainda não tem itens em caixas ===
function SemCaixas() {
  return (
    <div className="inicioJoiner__vazio envelopeCorreio">
      <Image src={carimboPostal} alt="" sizes="150px" className="inicioJoiner__vazioCarimbo" />

      <div className="inicioJoiner__vazioTextos">
        <p className="inicioJoiner__vazioEtiqueta">NENHUMA CAIXA AINDA</p>
        <h3 className="inicioJoiner__vazioTitulo">
          Sua primeira caixa <span>chega aqui</span>
        </h3>
        <p className="inicioJoiner__vazioTexto">
          Quando você garantir um item, a caixa dele aparece aqui com a etapa em que ela está.
        </p>
      </div>

      <div className="inicioJoiner__vazioAcoes">
        <Link href="/caixas" className="botao botao__rosa">
          Ver caixas abertas
        </Link>
        <Link href="/sem-dono" className="botao botao__contorno">
          Ver itens sem dono
        </Link>
      </div>
    </div>
  );
}

// === Seção: Esqueleto dos cartões enquanto as caixas carregam ===
function CaixasCarregando() {
  return (
    <ul className="inicioJoiner__listaCaixas" aria-busy="true">
      <li className="somenteLeitorTela">Carregando suas caixas…</li>
      {[1, 2, 3, 4].map((numero) => (
        <li key={numero} aria-hidden="true">
          <div className="caixaResumo caixaResumo__carregando">
            <span className="esqueleto caixaResumo__esqueletoTopo" />
            <span className="esqueleto caixaResumo__esqueletoNome" />
            <span className="esqueleto caixaResumo__esqueletoSelo" />
            <span className="esqueleto caixaResumo__esqueletoBarras" />
            <span className="esqueleto caixaResumo__esqueletoRodape" />
          </div>
        </li>
      ))}
    </ul>
  );
}
