import Image from "next/image";
import Link from "next/link";
import FaixaLetreiro from "@/componentes/FaixaLetreiro";
import { IconeEnviar } from "@/componentes/Icones";
import SeloPedidosAbertos from "@/componentes/SeloPedidosAbertos";
import type { CaixaAndamento, JoinerDevendo, ProofPendente } from "@/lib/painel";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import colagemPainel from "@/public/imagens/painel-colagem.webp";
import photocardPainel from "@/public/imagens/painel-photocard.png";
import ListaCaixasAndamento from "./ListaCaixasAndamento";
import TabelaFaltaPagar from "./TabelaFaltaPagar";
import "@/estilos/componentes/PecasItem.css";
import "@/estilos/paginas/Inicio.css";
import "@/estilos/paginas/InicioJoiner.css";
import "@/estilos/paginas/Painel.css";

const PROOFS_VISIVEIS = 6;

type PropsTelaPainel = {
  devendo: JoinerDevendo[];
  caixas: CaixaAndamento[];
  proofs: ProofPendente[];
};

// === Seção: Tela inicial da GOM ===
// Mesmo hero da tela inicial, com o título e as ações da GOM
export default function TelaPainel({ devendo, caixas, proofs }: PropsTelaPainel) {
  return (
    <>
      <section className="inicio__hero painelHero">
        <div className="inicio__conteudo">
          <div className="inicio__texto">
            <h1 className="inicio__titulo">
              <span className="inicio__tituloPreto">PAINEL</span>
              <span className="inicio__tituloRosa">STAFF</span>
            </h1>

            <div className="inicio__descricao">
              <p>Tudo da Lucky Cegs num lugar só.</p>
              <ul className="inicio__listaServicos">
                <li>Caixas e itens</li>
                <li>Pagamentos dos joiners</li>
                <li>Proofs da casa da GOM</li>
              </ul>
            </div>

            <div className="painelHero__botoes">
              <Link href="/caixas/nova" className="botao botao__rosa">
                + Nova caixa
              </Link>
              <Link href="/itens/novo" className="botao botao__rosa">
                + Adicionar item
              </Link>
            </div>
          </div>

          <div className="inicio__colagem">
            <Image
              src={colagemPainel}
              alt="Colagem com photocards, álbuns e cacarecos"
              priority
              sizes="(max-width: 860px) 90vw, 572px"
              className="inicio__imagemColagem"
            />
            <Image src={photocardPainel} alt="" sizes="170px" className="inicio__photocard" />
            <Image src={codigoBarras} alt="" sizes="160px" className="inicio__codigoBarras" />
            <SeloPedidosAbertos className="inicio__selo" />
          </div>
        </div>
      </section>

      <FaixaLetreiro variante="preta" className="inicioJoiner__letreiro" />

      <div className="painel__secoes">
        {/* === Seção: Quem falta pagar e caixas em andamento === */}
        <section className="inicioJoiner__faixa inicioJoiner__faixaQuadrados">
          <div className="painel__quadros">
            <div className="painel__coluna">
              <h2 className="inicioJoiner__titulo">
                QUEM FALTA
                <span className="inicioJoiner__tituloRosa">PAGAR</span>
              </h2>
              <TabelaFaltaPagar pessoas={devendo} />
            </div>

            <div className="painel__coluna painel__colunaCaixas">
              <h2 className="inicioJoiner__titulo painel__tituloDireita">
                CAIXAS EM
                <span className="inicioJoiner__tituloRosa">ANDAMENTO</span>
              </h2>
              <ListaCaixasAndamento caixas={caixas} />
            </div>
          </div>
        </section>

        {/* === Seção: Proofs para subir === */}
        <section className="inicioJoiner__faixa inicioJoiner__faixaCoracoes painel__faixaProofs">
          <div className="inicioJoiner__cartao painel__cartaoProofs">
            <div className="painel__topoProofs">
              <h2 className="inicioJoiner__titulo painel__tituloProofs">
                PROOFS
                <span className="inicioJoiner__tituloRosa">PARA SUBIR</span>
              </h2>
              {proofs.length > PROOFS_VISIVEIS && (
                <Link href="/proofs" className="botao botao__contorno painel__verTodas">
                  Ver todas ({proofs.length})
                </Link>
              )}
            </div>

            {proofs.length > 0 ? (
              <ul className="painel__proofs">
                {proofs.slice(0, PROOFS_VISIVEIS).map((proof) => (
                  <li key={`${proof.caixaId}-${proof.userId}`}>
                    <Link
                      href={`/proofs?caixa=${proof.caixaId}&joiner=${encodeURIComponent(proof.userId)}`}
                      className="painel__proof"
                    >
                      <IconeEnviar className="painel__proofIcone" />
                      <span className="painel__proofUser">@{proof.user}</span>
                      <span className="painel__proofCaixa">{proof.nomeCaixa}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ProofsEmDia />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

// === Seção: Aviso quando todas as proofs já subiram ===
// Três polaroides em leque, já reveladas, com o selo "tudo em dia"
function ProofsEmDia() {
  return (
    <div className="proofsEmDia" role="status">
      <div className="proofsEmDia__leque" aria-hidden="true">
        {[1, 2, 3].map((numero) => (
          <span key={numero} className="proofsEmDia__polaroide">
            <span className="proofsEmDia__foto" />
          </span>
        ))}
        <span className="proofsEmDia__selo">TUDO EM DIA</span>
      </div>

      <div className="proofsEmDia__texto">
        <p className="proofsEmDia__etiqueta">NENHUMA FOTO ESPERANDO</p>
        <h3 className="proofsEmDia__titulo">Todas as proofs subiram</h3>
        <p className="proofsEmDia__descricao">
          Quando uma caixa chegar na sua casa, os joiners dela aparecem aqui para você subir a foto de cada um.
        </p>
        <Link href="/proofs" className="botao botao__contorno proofsEmDia__botao">
          Ver proofs enviadas
        </Link>
      </div>
    </div>
  );
}
