import Image from "next/image";
import Link from "next/link";
import CartaoPostal from "@/componentes/CartaoPostal";
import CartaoPostalVazio from "@/componentes/CartaoPostalVazio";
import { IconeCheck } from "@/componentes/Icones";
import { ProvedorDetalhes } from "@/componentes/JanelaDetalhes";
import { juntarClasses } from "@/lib/classes";
import { type DetalheItem, montarDetalheItem } from "@/lib/detalheItem";
import { formatarData } from "@/lib/formatacao";
import type { CaixaComProofs, ProofsDaCaixa } from "@/lib/proofs";
import trevo from "@/public/imagens/adesivo-trevo-preto.png";
import fotoProofs from "@/public/imagens/modelo-proofs-gom.png";
import fotoPostalVazio from "@/public/imagens/photobook-pagina.png";
import { AcoesProof, BarraEnvio, FotoParaSoltar } from "./EnvioProof";
import "@/estilos/paginas/CasaDaGom.css";
import "@/estilos/paginas/Proofs.css";

type PropsTelaProofs = {
  caixas: CaixaComProofs[];
  dados: ProofsDaCaixa | null;
  joinerPedido: string;
};

function endereco(caixaId: number, userId?: string) {
  return `/proofs?caixa=${caixaId}${userId ? `&joiner=${encodeURIComponent(userId)}` : ""}`;
}

// === Seção: Proofs da GOM ===
// Escolhe a caixa no topo e o joiner à esquerda; à direita fica o cartão-postal desse joiner com a foto.
export default function TelaProofs({ caixas, dados, joinerPedido }: PropsTelaProofs) {
  const joiners = dados?.joiners ?? [];
  // Sem joiner no endereço, abre o primeiro (quem está com "falta" vem primeiro)
  const atual = joiners.find((j) => j.userId === joinerPedido) ?? joiners[0];
  const enviadas = joiners.filter((j) => j.proof).length;

  const detalhes: Record<number, DetalheItem> = dados
    ? Object.fromEntries(
        dados.itens.map((item) => [item.id, montarDetalheItem(item, dados.caixa.nome)]),
      )
    : {};

  return (
    <ProvedorDetalhes detalhes={detalhes} itemInicial={null} abaInicial="fotos" somenteFotos>
      <div className="casaGom proofsGom">
        {/* === Seção: Faixa do topo === */}
        <section className="casaGom__faixa">
          <div className="casaGom__faixaConteudo">
            <h1 className="tituloFaixa">
              <span>CASA DA</span>
              <span className="tituloFaixa__rosa">
                GOM<span className="casaGom__cursiva">proofs</span>
              </span>
            </h1>

            {caixas.length > 0 && (
              <nav className="proofsGom__caixas" aria-label="Caixas na casa da GOM">
                {caixas.map((caixa) => (
                  <Link
                    key={caixa.id}
                    href={endereco(caixa.id)}
                    scroll={false}
                    className={juntarClasses(
                      "pilulaSelecao",
                      caixa.id === dados?.caixa.id && "pilulaSelecao__ativa",
                    )}
                    aria-current={caixa.id === dados?.caixa.id ? "page" : undefined}
                  >
                    {caixa.nome}
                  </Link>
                ))}
              </nav>
            )}

            <div className="casaGom__colagem" aria-hidden="true">
              <span className="casaGom__quadrado" />
              <Image src={fotoProofs} alt="" sizes="190px" className="casaGom__foto" priority />
              <Image src={trevo} alt="" sizes="80px" className="casaGom__cd casaGom__trevo" />
            </div>
          </div>
        </section>

        <div className="casaGom__conteudo">
          {dados && atual ? (
            <div className="proofsGom__grade">
              {/* === Seção: Joiners da caixa === */}
              <div className="proofsGom__lista">
                <div className="proofsGom__topoLista">
                  <h2 className="proofsGom__tituloLista">Joiners da {dados.caixa.nome}</h2>
                  <span
                    className="proofsGom__contagem"
                    aria-label={`${enviadas} de ${joiners.length} proofs enviadas`}
                  >
                    {enviadas}/{joiners.length}
                  </span>
                </div>
                <ul className="proofsGom__joiners">
                  {joiners.map((joiner) => {
                    const ativo = joiner.userId === atual.userId;
                    return (
                      <li key={joiner.userId}>
                        <Link
                          href={endereco(dados.caixa.id, joiner.userId)}
                          scroll={false}
                          className={juntarClasses(
                            "proofsGom__joiner",
                            ativo && "proofsGom__joinerAtivo",
                          )}
                          aria-current={ativo ? "true" : undefined}
                        >
                          <span className="proofsGom__inicial" aria-hidden="true">
                            {(joiner.nome || joiner.user).charAt(0).toUpperCase()}
                          </span>
                          <span className="proofsGom__quem">
                            <span>
                              <strong>{joiner.nome}</strong> @{joiner.user}
                            </span>
                            <span>
                              {joiner.itens.length}{" "}
                              {joiner.itens.length === 1 ? "item" : "itens"}
                            </span>
                          </span>
                          <span className={joiner.proof ? "proofsGom__enviada" : "proofsGom__falta"}>
                            {joiner.proof ? "enviada" : "falta"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* === Seção: Envio e cartão-postal do joiner escolhido === */}
              <div className="proofsGom__direita">
                {!atual.proof ? (
                  <BarraEnvio
                    key={`envio-${atual.userId}`}
                    joiner={{ caixaId: dados.caixa.id, userId: atual.userId }}
                    nome={`${atual.nome} @${atual.user}`}
                  />
                ) : (
                  enviadas === joiners.length && (
                    <p className="proofsGom__tudoEnviado" role="status">
                      <IconeCheck tamanho={16} aria-hidden="true" />
                      Todas as proofs desta caixa subiram
                    </p>
                  )
                )}

                <CartaoPostal
                  key={`postal-${atual.userId}`}
                  caixa={{
                    id: dados.caixa.id,
                    nome: dados.caixa.nome,
                    fotoId: atual.proof?.fotoId ?? null,
                    chegouEm: formatarData(dados.caixa.chegouEm),
                    enviadaEm: atual.proof ? formatarData(atual.proof.enviadaEm) : null,
                    itens: atual.itens,
                  }}
                  para={{ nome: atual.nome, user: atual.user }}
                  descricaoFoto={`Proof de @${atual.user} da ${dados.caixa.nome}`}
                  semFoto={
                    <FotoParaSoltar
                      joiner={{ caixaId: dados.caixa.id, userId: atual.userId }}
                    />
                  }
                  acoes={
                    atual.proof && (
                      <AcoesProof
                        joiner={{ caixaId: dados.caixa.id, userId: atual.userId }}
                        user={atual.user}
                      />
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <CartaoPostalVazio
              legendaFoto="AS PROOFS FICAM AQUI"
              titulo="Nenhuma caixa na sua casa"
              cursiva="o correio ainda não passou"
              descricao="Quando uma caixa chegar na casa da GOM, os joiners dela aparecem aqui para você subir a foto de cada um."
              foto={fotoPostalVazio}
              acoes={
                <>
                  <Link href="/caixas" className="botao botao__rosa">
                    Ver as caixas
                  </Link>
                  <Link href="/painel" className="botao botao__contorno">
                    Ir para o painel
                  </Link>
                </>
              }
            />
          )}
        </div>
      </div>
    </ProvedorDetalhes>
  );
}