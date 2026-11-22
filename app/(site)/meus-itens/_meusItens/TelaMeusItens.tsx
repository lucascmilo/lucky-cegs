import { CldImage } from "next-cloudinary";
import Image from "next/image";
import Link from "next/link";
import { IconeCheck, IconeSetaBaixo } from "@/componentes/Icones";
import { BotaoDetalhes, ProvedorDetalhes } from "@/componentes/JanelaDetalhes";
import { PilulaEtapa, ValorPagamento } from "@/componentes/PecasItem";
import { PONTOS_ESTRELA } from "@/componentes/SeloPedidosAbertos";
import type { ItemCaixa } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import { ABAS_DETALHES, montarDetalheItem, type DetalheItem } from "@/lib/detalheItem";
import { obterEtapaCaixa } from "@/lib/etapas";
import type { CaixaComMeusItens } from "@/lib/meusItens";
import adesivo from "@/public/imagens/adesivo-accidentally.png";
import fotoMeusItens from "@/public/imagens/meus-itens-foto.png";
import "@/estilos/componentes/PecasItem.css";
import "@/estilos/paginas/MeusItens.css";

// Pendentes = ainda não chegaram; Chegaram = já estão na casa da GOM
const FILTROS = [
  { id: "todos", rotulo: "Todos", combina: () => true },
  { id: "pendentes", rotulo: "Pendentes", combina: (item: ItemCaixa) => item.situacao !== "casa_gom" },
  { id: "chegaram", rotulo: "Chegaram", combina: (item: ItemCaixa) => item.situacao === "casa_gom" },
] as const;

type Filtro = (typeof FILTROS)[number]["id"];

type ParametrosMeusItens = {
  filtro?: string | string[];
  item?: string | string[];
  aba?: string | string[];
};

type PropsTelaMeusItens = {
  caixas: CaixaComMeusItens[];
  parametros: ParametrosMeusItens;
};

function textoDe(valor: string | string[] | undefined) {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}

// === Seção: Tela "Meus itens" ===
export default function TelaMeusItens({ caixas, parametros }: PropsTelaMeusItens) {
  const filtroAtual = FILTROS.find((f) => f.id === textoDe(parametros.filtro)) ?? FILTROS[0];
  const todosItens = caixas.flatMap((grupo) => grupo.itens);

  const caixasVisiveis = caixas
    .map((grupo) => ({ ...grupo, itens: grupo.itens.filter(filtroAtual.combina) }))
    .filter((grupo) => grupo.itens.length > 0);

  // Os detalhes já vão prontos para o navegador: a janela abre na hora
  const detalhes: Record<number, DetalheItem> = Object.fromEntries(
    caixas.flatMap((grupo) => grupo.itens.map((item) => [item.id, montarDetalheItem(item, grupo.caixa.nome)])),
  );
  const abaPedida = ABAS_DETALHES.find((a) => a.id === textoDe(parametros.aba))?.id ?? "fotos";

  return (
    <ProvedorDetalhes detalhes={detalhes} itemInicial={Number(textoDe(parametros.item)) || null} abaInicial={abaPedida}>
      <div className="meusItens">
        {/* === Seção: Faixa do topo === */}
        <section className="meusItens__faixa">
          <div className="meusItens__faixaConteudo">
            <h1 className="meusItens__titulo">
              MEUS
              <br />
              ITENS
            </h1>

            {todosItens.length > 0 && (
              <nav className="meusItens__filtros" aria-label="Filtrar meus itens">
                {FILTROS.map((f) => (
                  <Link
                    key={f.id}
                    href={f.id === "todos" ? "/meus-itens" : `/meus-itens?filtro=${f.id}`}
                    className={juntarClasses("pilulaSelecao", f.id === filtroAtual.id && "pilulaSelecao__ativa")}
                    aria-current={f.id === filtroAtual.id ? "page" : undefined}
                    scroll={false}
                  >
                    {f.rotulo} · {todosItens.filter(f.combina).length}
                  </Link>
                ))}
              </nav>
            )}

            <div className="meusItens__colagem" aria-hidden="true">
              <span className="meusItens__quadrado" />
              <svg className="meusItens__estrela" viewBox="0 0 100 100">
                <polygon points={PONTOS_ESTRELA} />
              </svg>
              <Image src={fotoMeusItens} alt="" sizes="190px" className="meusItens__foto" priority />
              <Image src={adesivo} alt="" sizes="220px" className="meusItens__adesivo" />
            </div>
          </div>
        </section>

        {/* === Seção: Cartões das caixas === */}
        <div className="meusItens__conteudo">
          {caixasVisiveis.length > 0 ? (
            caixasVisiveis.map((grupo) => <CartaoCaixa key={grupo.caixa.id} grupo={grupo} detalhes={detalhes} />)
          ) : (
            <SemItens filtro={todosItens.length > 0 ? filtroAtual.id : null} />
          )}
        </div>
      </div>
    </ProvedorDetalhes>
  );
}

// === Seção: Cartão de uma caixa (folha de caderno) ===
function CartaoCaixa({ grupo, detalhes }: { grupo: CaixaComMeusItens; detalhes: Record<number, DetalheItem> }) {
  const etapa = obterEtapaCaixa(grupo.caixa.situacao);
  const idTitulo = `caixa-${grupo.caixa.id}`;

  return (
    <section className="cartaoMeusItens" aria-labelledby={idTitulo}>
      <span className="cartaoMeusItens__espiral" aria-hidden="true" />
      <div className="cartaoMeusItens__topo">
        <h2 id={idTitulo} className="cartaoMeusItens__titulo">
          {grupo.caixa.nome}
        </h2>
        <span className="pilulaEtapa cartaoMeusItens__etapa" style={{ backgroundColor: etapa.cor }}>
          {etapa.rotulo}
        </span>
      </div>

      <ul className="cartaoMeusItens__lista">
        {grupo.itens.map((item) => (
          <li key={item.id}>
            <LinhaItem item={item} detalhe={detalhes[item.id]} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// === Seção: Linha de um item (abre para mostrar os valores) ===
function LinhaItem({ item, detalhe }: { item: ItemCaixa; detalhe: DetalheItem }) {
  const membros = item.minhasPartes.map((p) => p.membro).filter(Boolean);
  const grupoMembro = [item.grupo, membros.join(", ")].filter(Boolean).join(" · ");

  return (
    <details className="linhaMeuItem">
      <summary className="linhaMeuItem__resumo">
        <span className="linhaMeuItem__miniatura">
          {item.fotoId && <CldImage src={item.fotoId} alt="" width={92} height={92} crop="fill" sizes="46px" />}
        </span>

        <span className="linhaMeuItem__textos">
          <span className="linhaMeuItem__nome" title={item.nome}>
            {item.nome}
          </span>
          {grupoMembro && <span className="linhaMeuItem__grupo">{grupoMembro}</span>}
        </span>

        <PilulaEtapa situacao={item.situacao} className="linhaMeuItem__etapa" />

        {detalhe.tudoPago ? (
          <span className="linhaMeuItem__valor linhaMeuItem__pago">
            <IconeCheck tamanho={12} /> Pago
          </span>
        ) : (
          <span className="linhaMeuItem__valor linhaMeuItem__falta">
            <span className="somenteLeitorTela">Falta pagar </span>
            {detalhe.faltaPagar ?? "A definir"}
          </span>
        )}

        <IconeSetaBaixo className="linhaMeuItem__seta" tamanho={30} />
      </summary>

      <div className="linhaMeuItem__aberta">
        <dl className="linhaMeuItem__pagamentos">
          {detalhe.pagamento.map((linha) => (
            <div key={linha.rotulo} className="linhaMeuItem__pagamento">
              <dt>{linha.rotulo}</dt>
              <dd>
                <ValorPagamento valor={linha.valor} estado={linha.estado} />
              </dd>
            </div>
          ))}
        </dl>
        <BotaoDetalhes itemId={item.id} className="linhaMeuItem__detalhes" />
      </div>
    </details>
  );
}

// === Seção: Aviso quando não há itens ===
function SemItens({ filtro }: { filtro: Filtro | null }) {
  const textos =
    filtro === null
      ? {
          etiqueta: "NENHUM ITEM AINDA",
          texto: "Quando você pedir um item numa caixa, ele aparece aqui com os valores para pagar.",
        }
      : filtro === "chegaram"
        ? { etiqueta: "NADA CHEGOU AINDA", texto: "Quando um item seu chegar na casa da GOM, ele aparece aqui." }
        : { etiqueta: "TUDO JÁ CHEGOU", texto: "Nenhum item seu está a caminho agora." };

  return (
    <div className="meusItens__vazio">
      <span className="cartaoMeusItens__espiral" aria-hidden="true" />
      <p className="meusItens__vazioEtiqueta">{textos.etiqueta}</p>
      <p className="meusItens__vazioTexto">{textos.texto}</p>
      {filtro === null ? (
        <Link href="/caixas" className="botao botao__contorno meusItens__vazioBotao">
          Ver as caixas
        </Link>
      ) : (
        <Link href="/meus-itens" className="botao botao__contorno meusItens__vazioBotao" scroll={false}>
          Ver todos
        </Link>
      )}
    </div>
  );
}
