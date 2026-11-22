import Image from "next/image";
import Link from "next/link";
import { FotosDoItem } from "@/componentes/FotoItem";
import { IconeSetaBaixo } from "@/componentes/Icones";
import { PilulaEtapa } from "@/componentes/PecasItem";
import TextoCortado from "@/componentes/TextoCortado";
import { formatarReais, normalizarBusca } from "@/lib/formatacao";
import { textoDoParametro } from "@/lib/navegacao";
import { textoCustosExtras, type ItemSemDono } from "@/lib/semDono";
import chaveiro from "@/public/imagens/chaveiro.png";
import fotoSemDono from "@/public/imagens/sem-dono-foto.png";
import BotaoQueroEsse from "./BotaoQueroEsse";
import "@/estilos/paginas/SemDono.css";

const CARTOES_POR_VEZ = 4;

type ParametrosSemDono = { busca?: string | string[]; mostrar?: string | string[] };

type PropsTelaSemDono = {
  itens: ItemSemDono[];
  logado: boolean;
  parametros: ParametrosSemDono;
};

// === Seção: Tela de itens sem dono ===
export default function TelaSemDono({ itens, logado, parametros }: PropsTelaSemDono) {
  const busca = textoDoParametro(parametros.busca).trim();
  const mostrar = Math.max(CARTOES_POR_VEZ, Number(textoDoParametro(parametros.mostrar)) || CARTOES_POR_VEZ);

  // A busca procura no nome, grupo, membro e caixa ("caixa 5" mostra só os da Caixa 5)
  const termo = normalizarBusca(busca);
  const encontrados = termo
    ? itens.filter((item) =>
        [item.nome, item.grupo, item.membro, item.nomeCaixa].some((texto) => texto && normalizarBusca(texto).includes(termo)),
      )
    : itens;
  const restantes = encontrados.length - mostrar;

  function endereco(mudancas: { mostrar?: number; limparBusca?: boolean }) {
    const consulta = new URLSearchParams();
    if (busca && !mudancas.limparBusca) consulta.set("busca", busca);
    if (mudancas.mostrar) consulta.set("mostrar", String(mudancas.mostrar));
    const texto = consulta.toString();
    return `/sem-dono${texto ? `?${texto}` : ""}`;
  }

  return (
    <div className="semDono">
      {/* === Seção: Faixa do topo === */}
      <section className="semDono__faixa">
        <div className="semDono__faixaConteudo">
          <h1 className="tituloFaixa">
            <span>ITENS</span>
            <span className="tituloFaixa__rosa">sem dono</span>
          </h1>
          <p className="tituloFaixa__subtitulo">Itens que sobraram nas caixas. Peça claim e a GOM confirma no seu privado.</p>

          <div className="semDono__colagem" aria-hidden="true">
            <span className="semDono__quadrado fundoPontosRosa" />
            <Image src={fotoSemDono} alt="" sizes="190px" className="semDono__foto" priority />
            <Image src={chaveiro} alt="" sizes="153px" className="semDono__chaveiro" />
          </div>
        </div>
      </section>

      <div className="semDono__conteudo">
        {/* === Seção: Como funciona a claim (começa fechado) === */}
        <details className="semDono__comoFunciona">
          <summary className="semDono__comoFuncionaTitulo">
            Como funciona a claim
            <IconeSetaBaixo className="semDono__seta" tamanho={30} />
          </summary>
          <ol className="semDono__passos listaEstrelas">
            <li>
              Toque em <strong>Quero esse</strong> no item.
            </li>
            <li>A GOM confirma quem ficou com ele, por ordem do pedido.</li>
            <li>
              Confirmado, o item aparece em <strong>Meus itens</strong> com os valores para pagar.
            </li>
          </ol>
        </details>

        {/* === Seção: Busca === */}
        {itens.length > 0 && (
          <form className="semDono__busca" action="/sem-dono" role="search">
            <label className="somenteLeitorTela" htmlFor="busca-sem-dono">
              Buscar nos itens sem dono
            </label>
            <input
              id="busca-sem-dono"
              className="semDono__campoBusca"
              type="search"
              name="busca"
              defaultValue={busca}
              placeholder="Buscar item, grupo, membro ou caixa…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="semDono__botaoBusca">
              Buscar
            </button>
          </form>
        )}
        {busca && (
          <p className="semDono__resultadoBusca" aria-live="polite">
            {encontrados.length === 1 ? "1 item encontrado" : `${encontrados.length} itens encontrados`} para “{busca}”.{" "}
            <Link href={endereco({ limparBusca: true })} scroll={false}>
              Limpar busca
            </Link>
          </p>
        )}

        {/* === Seção: Cartões === */}
        {encontrados.length > 0 ? (
          <>
            <ul className="semDono__lista">
              {encontrados.slice(0, mostrar).map((item) => (
                <li key={item.id}>
                  <CartaoSemDono item={item} logado={logado} />
                </li>
              ))}
            </ul>
            {restantes > 0 && (
              <Link href={endereco({ mostrar: mostrar + CARTOES_POR_VEZ })} scroll={false} className="botao botao__contorno semDono__verMais">
                Ver mais {restantes} {restantes === 1 ? "item" : "itens"}
              </Link>
            )}
          </>
        ) : (
          <SemItens buscando={Boolean(busca)} />
        )}
      </div>
    </div>
  );
}

// === Seção: Cartão de um item sem dono ===
function CartaoSemDono({ item, logado }: { item: ItemSemDono; logado: boolean }) {
  const grupoMembro = [item.grupo, item.membro].filter(Boolean).join(" · ");

  return (
    <article className="cartaoSemDono">
      <FotosDoItem item={item} className="cartaoSemDono__fotos" classeFoto="cartaoSemDono__foto" />

      <h2 className="cartaoSemDono__nome">
        <TextoCortado texto={item.nome} />
      </h2>
      {grupoMembro && <p className="cartaoSemDono__grupo">{grupoMembro}</p>}

      <div className="cartaoSemDono__pilulas">
        <PilulaEtapa situacao={item.situacao} />
        <span className="pilulaContorno">{item.nomeCaixa}</span>
      </div>

      <p className="cartaoSemDono__preco">{item.preco === null ? "A definir" : formatarReais(item.preco)}</p>
      <p className="cartaoSemDono__custos">{textoCustosExtras(item.situacao)}</p>

      <BotaoQueroEsse registroId={item.id} logado={logado} pedidoEnviado={item.pedidoEnviado} />
    </article>
  );
}

// === Seção: Aviso quando não há itens ===
// Um cartão com o chaveiro balançando: sem itens na lista ou sem resultado na busca
function SemItens({ buscando }: { buscando: boolean }) {
  const textos = buscando
    ? {
        etiqueta: "NADA COM ESSE NOME",
        titulo: "Nenhum item encontrado",
        texto: "Confira a escrita ou tente outra palavra: dá para buscar pelo item, grupo, membro ou caixa.",
      }
    : {
        etiqueta: "TUDO JÁ TEM DONO",
        titulo: "Nenhum item sobrando",
        texto: "Por enquanto nenhum item sobrou nas caixas. Quando sobrar, ele aparece aqui primeiro.",
      };

  return (
    <div className="semDonoVazio" role="status">
      <div className="semDonoVazio__arte" aria-hidden="true">
        <div className="semDonoVazio__selo">
          <svg className="semDonoVazio__anel" viewBox="0 0 240 240">
            <defs>
              <path id="anel-sem-dono" d="M 120 120 m -106 0 a 106 106 0 1 1 212 0 a 106 106 0 1 1 -212 0" />
            </defs>
            <text textLength="660" lengthAdjust="spacing">
              <textPath href="#anel-sem-dono">ITENS SEM DONO ★ ITENS SEM DONO ★ ITENS SEM DONO ★</textPath>
            </text>
          </svg>
          <span className="semDonoVazio__sombra" />
          <span className="semDonoVazio__circulo" />
          <span className="semDonoVazio__prego" />
          <Image src={chaveiro} alt="" unoptimized className="semDonoVazio__chaveiro" />
        </div>
      </div>

      <div className="semDonoVazio__conteudo">
        <p className="semDonoVazio__etiqueta">{textos.etiqueta}</p>
        <h2 className="semDonoVazio__titulo">{textos.titulo}</h2>
        <p className="semDonoVazio__texto">{textos.texto}</p>
        {buscando ? (
          <Link href="/sem-dono" className="botao botao__contorno semDonoVazio__botao" scroll={false}>
            Limpar busca
          </Link>
        ) : (
          <Link href="/caixas" className="botao botao__rosa semDonoVazio__botao">
            Ver as caixas
          </Link>
        )}
      </div>
    </div>
  );
}
