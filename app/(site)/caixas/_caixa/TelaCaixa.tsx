import Link from "next/link";
import { RegistroVisita } from "@/componentes/Novidade";
import type { CaixaAberta, DetalheCaixa, ItemCaixa, PessoaItem } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import CartaoSet from "./CartaoSet";
import FaixaCaixa from "./FaixaCaixa";
import PedidosIndividuais, { CARTOES_POR_VEZ } from "./PedidosIndividuais";
import "@/estilos/paginas/Caixa.css";

const FILTROS = [
  { id: "todos", rotulo: "Todos" },
  { id: "meus", rotulo: "Meus" },
  { id: "sets", rotulo: "Sets" },
] as const;

type Filtro = (typeof FILTROS)[number]["id"];

// Valores lidos do endereço (?filtro=meus&busca=harua&mostrar=8)
type ParametrosCaixa = {
  filtro?: string | string[];
  busca?: string | string[];
  mostrar?: string | string[];
};

type PropsTelaCaixa = {
  caixa: DetalheCaixa;
  caixasAbertas: CaixaAberta[];
  itens: ItemCaixa[];
  eu: Pick<PessoaItem, "nome" | "user">;
  parametros: ParametrosCaixa;
};

// === Seção: Busca ===
// Ignora maiúsculas e acentos ("japao" encontra "Japão")
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function itemCombina(item: ItemCaixa, busca: string) {
  const textos = [
    item.nome,
    item.grupo,
    ...item.outrasPessoas.flatMap((p) => [p.nome, p.user, ...p.versoes]),
    ...item.minhasPartes.map((p) => p.membro),
    item.dono?.nome,
    item.dono?.user,
  ];
  return textos.some((texto) => texto && normalizar(texto).includes(busca));
}

function textoDe(valor: string | string[] | undefined) {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}

// === Seção: Tela de uma caixa ===
export default function TelaCaixa({ caixa, caixasAbertas, itens, eu, parametros }: PropsTelaCaixa) {
  const filtro: Filtro = FILTROS.find((f) => f.id === textoDe(parametros.filtro))?.id ?? "todos";
  const busca = textoDe(parametros.busca).trim();
  const mostrar = Math.max(CARTOES_POR_VEZ, Number(textoDe(parametros.mostrar)) || CARTOES_POR_VEZ);

  // Monta o endereço mantendo filtro e busca (o "Ver mais" volta ao início quando eles mudam)
  function endereco(mudancas: { filtro?: Filtro; mostrar?: number; limparBusca?: boolean }) {
    const consulta = new URLSearchParams();
    const proximoFiltro = mudancas.filtro ?? filtro;
    if (proximoFiltro !== "todos") consulta.set("filtro", proximoFiltro);
    if (busca && !mudancas.limparBusca) consulta.set("busca", busca);
    if (mudancas.mostrar) consulta.set("mostrar", String(mudancas.mostrar));
    const texto = consulta.toString();
    return `/caixas/${caixa.id}${texto ? `?${texto}` : ""}`;
  }

  // Set = item dividido entre mais de uma pessoa; os demais são pedidos individuais
  const eMeu = (item: ItemCaixa) => item.minhasPartes.length > 0;
  const sets = itens.filter((item) => item.totalPessoas > 1);
  const contagens: Record<Filtro, number> = { todos: itens.length, meus: itens.filter(eMeu).length, sets: sets.length };

  const termo = normalizar(busca);
  const encontrados = termo ? itens.filter((item) => itemCombina(item, termo)) : itens;
  const doFiltro = filtro === "meus" ? encontrados.filter(eMeu) : encontrados;
  const setsVisiveis = doFiltro.filter((item) => item.totalPessoas > 1);
  // Os pedidos do próprio joiner aparecem primeiro
  const individuaisVisiveis =
    filtro === "sets"
      ? []
      : doFiltro.filter((item) => item.totalPessoas <= 1).sort((a, b) => Number(eMeu(b)) - Number(eMeu(a)));

  return (
    <>
      <RegistroVisita caixaId={caixa.id} />
      <FaixaCaixa caixa={caixa} caixasAbertas={caixasAbertas} />

      <div className="caixaItens">
        {/* === Seção: Filtros e busca === */}
        <div className="caixaItens__barra">
          <nav className="caixaItens__filtros" aria-label="Filtrar itens">
            {FILTROS.map((f) => (
              <Link
                key={f.id}
                href={endereco({ filtro: f.id })}
                className={juntarClasses("pilulaSelecao", f.id === filtro && "pilulaSelecao__ativa")}
                aria-current={f.id === filtro ? "page" : undefined}
                scroll={false}
              >
                {f.rotulo} · {contagens[f.id]}
              </Link>
            ))}
          </nav>

          <form className="caixaItens__busca" action={`/caixas/${caixa.id}`} role="search">
            {filtro !== "todos" && <input type="hidden" name="filtro" value={filtro} />}
            <label className="somenteLeitorTela" htmlFor="busca-caixa">
              Buscar nesta caixa
            </label>
            <input
              id="busca-caixa"
              className="caixaItens__campoBusca"
              type="search"
              name="busca"
              defaultValue={busca}
              placeholder="Buscar item, membro ou @…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="caixaItens__botaoBusca">
              Buscar
            </button>
          </form>
        </div>
        <p className="caixaItens__aviso">Você vê todos os itens da caixa, mas valores e pagamentos só os seus</p>

        {busca && (
          <p className="caixaItens__resultadoBusca" aria-live="polite">
            {encontrados.length === 1 ? "1 item encontrado" : `${encontrados.length} itens encontrados`} para “{busca}”.{" "}
            <Link href={endereco({ limparBusca: true })} scroll={false}>
              Limpar busca
            </Link>
          </p>
        )}

        {/* === Seção: Sets === */}
        {setsVisiveis.length > 0 && (
          <section className="caixaItens__secao" aria-labelledby="titulo-sets">
            <h2 id="titulo-sets" className="caixaItens__titulo">
              SETS
            </h2>
            <div className="caixaItens__sets">
              {setsVisiveis.map((item) => (
                <CartaoSet key={item.id} item={item} eu={eu} caixaId={caixa.id} />
              ))}
            </div>
          </section>
        )}

        {/* === Seção: Pedidos individuais === */}
        {individuaisVisiveis.length > 0 && (
          <section className="caixaItens__secao" aria-labelledby="titulo-individuais">
            <h2 id="titulo-individuais" className="caixaItens__titulo">
              PEDIDOS
              <span className="caixaItens__tituloRosa">INDIVIDUAIS</span>
            </h2>
            <PedidosIndividuais
              itens={individuaisVisiveis}
              caixaId={caixa.id}
              mostrar={mostrar}
              enderecoVerMais={endereco({ mostrar: mostrar + CARTOES_POR_VEZ })}
            />
          </section>
        )}

        {setsVisiveis.length === 0 && individuaisVisiveis.length === 0 && (
          <div className="caixaItens__vazio envelopeCorreio">
            <p className="caixaItens__vazioEtiqueta">NADA POR AQUI</p>
            <p>
              {busca
                ? "Nenhum item com esse nome. Confira a escrita ou tente outra palavra."
                : filtro === "todos"
                  ? "Essa caixa ainda não tem itens."
                  : "Nenhum item neste filtro."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
