"use client";

import { CldImage } from "next-cloudinary";
import { Fragment, useEffect, useState, useTransition, type CSSProperties } from "react";
import { IconeCamera, IconeLapis, IconeLupa } from "@/componentes/Icones";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import JanelaFotos, { temFoto } from "@/componentes/JanelaFotos";
import { juntarClasses } from "@/lib/classes";
import { obterEtapaItem, type EtapaItem } from "@/lib/etapas";
import { normalizarBusca } from "@/lib/formatacao";
import {
  CATEGORIAS,
  resumirCaixa,
  type CaixaGom,
  type JoinerOpcao,
  type ParteGom,
  type Quantidades,
  type RegistroGom,
} from "@/lib/planilhaCaixa";
import { desfazerMover, moverItens, type EstadoItem } from "../acoes";
import JanelaItem from "./JanelaItem";

export type Ordem = "item" | "joiner";

// === Seção: Filtros rápidos ===
// As etapas só aparecem com a caixa na warehouse (depois disso todos os itens estão na mesma etapa)
const FILTROS_FIXOS = [
  { id: "todos", rotulo: "Todos" },
  { id: "a-pagar", rotulo: "A pagar" },
  { id: "sem-dono", rotulo: "Sem dono" },
  { id: "sets", rotulo: "Sets" },
] as const;

const FILTROS_ETAPA: { id: EtapaItem; rotulo: string }[] = [
  { id: "esperando", rotulo: "Esperando" },
  { id: "comprado", rotulo: "Comprado" },
  { id: "warehouse", rotulo: "Na warehouse" },
];

export type Filtro = (typeof FILTROS_FIXOS)[number]["id"] | EtapaItem;
const FILTROS_VALIDOS: string[] = [...FILTROS_FIXOS.map((filtro) => filtro.id), ...FILTROS_ETAPA.map((filtro) => filtro.id)];

// Algum valor lançado e ainda não pago
function temAPagar(registro: RegistroGom) {
  return registro.partes.some(
    (p) => (p.venda !== null && !p.vendaPago) || (p.inter !== null && !p.interPago) || (p.taxa !== null && !p.taxaPago),
  );
}

function passaNoFiltro(registro: RegistroGom, filtro: Filtro) {
  if (filtro === "todos") return true;
  if (filtro === "a-pagar") return temAPagar(registro);
  if (filtro === "sem-dono") return registro.semDono;
  if (filtro === "sets") return registro.tipo === "set";
  return registro.situacao === filtro;
}

// Com muitos itens, a tabela mostra 50 por vez
const POR_VEZ = 50;

// Itens sem dono vão para o fim quando a ordem é por joiner
const FIM_DA_LISTA = "￿";

function primeiroJoiner(registro: RegistroGom) {
  return registro.partes[0]?.user ?? FIM_DA_LISTA;
}

// Set (ou item com mais de uma pessoa): uma linha do set e uma linha por parte
function ehGrupo(registro: RegistroGom) {
  return registro.tipo === "set" || registro.partes.length > 1;
}

// === Seção: Registros da planilha (GOM) ===
// Busca, ordem e filtro ficam no endereço (?busca=…&ordem=joiner&filtro=a-pagar): voltar à página mantém tudo igual.
type PropsPlanilha = {
  caixa: CaixaGom;
  caixas: CaixaGom[];
  registros: RegistroGom[];
  joiners: JoinerOpcao[];
  // Valores lidos do endereço ao abrir a página
  inicial: { busca: string; ordem: string; filtro: string };
};

export default function PlanilhaCaixa({ caixa, caixas, registros, joiners, inicial }: PropsPlanilha) {
  const [editando, setEditando] = useState<RegistroGom | null>(null);
  const [busca, setBusca] = useState(inicial.busca);
  const [ordem, setOrdem] = useState<Ordem>(inicial.ordem === "joiner" ? "joiner" : "item");
  const [filtro, setFiltro] = useState<Filtro>(FILTROS_VALIDOS.includes(inicial.filtro) ? (inicial.filtro as Filtro) : "todos");
  const [mostrar, setMostrar] = useState(POR_VEZ);
  const [desfazer, setDesfazer] = useState<EstadoItem[] | null>(null);
  const [desfazendo, iniciarDesfazer] = useTransition();
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [destino, setDestino] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [movendo, iniciar] = useTransition();
  const [fotosDe, setFotosDe] = useState<RegistroGom | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // O aviso de "itens movidos" (com o "Desfazer") some sozinho depois de alguns segundos
  useEffect(() => {
    if (!aviso) return;
    const tempo = window.setTimeout(() => {
      setAviso(null);
      setDesfazer(null);
    }, 10000);
    return () => window.clearTimeout(tempo);
  }, [aviso]);

  // Guarda busca, ordem e filtro no endereço sem recarregar a página
  useEffect(() => {
    const endereco = new URL(window.location.href);
    const valores = { busca: busca.trim(), ordem: ordem === "item" ? "" : ordem, filtro: filtro === "todos" ? "" : filtro };
    for (const [chave, valor] of Object.entries(valores)) {
      if (valor) endereco.searchParams.set(chave, valor);
      else endereco.searchParams.delete(chave);
    }
    if (endereco.href !== window.location.href) window.history.replaceState(window.history.state, "", endereco);
  }, [busca, ordem, filtro]);

  const naWarehouse = caixa.situacao === "warehouse";
  const filtros = [...FILTROS_FIXOS, ...(naWarehouse ? FILTROS_ETAPA : [])].map((opcao) => ({
    ...opcao,
    quantos: registros.filter((r) => passaNoFiltro(r, opcao.id)).length,
  }));
  // Filtro de etapa que não existe mais nesta caixa volta para "Todos"
  const filtroAtivo: Filtro = filtros.some((opcao) => opcao.id === filtro) ? filtro : "todos";

  const termo = normalizarBusca(busca);
  const encontrados = registros.filter(
    (r) =>
      passaNoFiltro(r, filtroAtivo) &&
      (!termo ||
        [r.nome, r.grupo, r.membro, ...r.partes.flatMap((p) => [p.user, `@${p.user}`, p.membro])].some(
          (texto) => texto && normalizarBusca(texto).includes(termo),
        )),
  );
  const visiveis =
    ordem === "joiner"
      ? [...encontrados]
          .map((r) => ({ ...r, partes: [...r.partes].sort((a, b) => a.user.localeCompare(b.user)) }))
          .sort((a, b) => primeiroJoiner(a).localeCompare(primeiroJoiner(b)))
      : encontrados;

  // Só conta os selecionados que ainda existem na caixa (some da seleção quem foi movido)
  const idsSelecionados = registros.filter((r) => selecionados.has(r.id)).map((r) => r.id);
  const exibidos = visiveis.slice(0, mostrar);
  const restantes = visiveis.length - exibidos.length;
  const todosVisiveisMarcados = exibidos.length > 0 && exibidos.every((r) => selecionados.has(r.id));
  const algumVisivelMarcado = exibidos.some((r) => selecionados.has(r.id));
  const outrasCaixas = caixas.filter((c) => c.id !== caixa.id);
  const total = resumirCaixa(visiveis);

  function alternar(id: number) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      for (const r of exibidos) {
        if (todosVisiveisMarcados) novo.delete(r.id);
        else novo.add(r.id);
      }
      return novo;
    });
  }

  function mover() {
    setErro(null);
    setAviso(null);
    const quantos = idsSelecionados.length;
    const nomeDestino = outrasCaixas.find((c) => String(c.id) === destino)?.nome ?? "outra caixa";
    iniciar(async () => {
      const resultado = await moverItens(idsSelecionados, Number(destino));
      if (!resultado.ok) return setErro(resultado.erro);
      setSelecionados(new Set());
      setDestino("");
      setDesfazer(resultado.anteriores);
      setAviso(`${quantos} ${quantos === 1 ? "item movido" : "itens movidos"} para ${nomeDestino}.`);
    });
  }

  function voltarMover() {
    if (!desfazer) return;
    setErro(null);
    iniciarDesfazer(async () => {
      const resultado = await desfazerMover(desfazer);
      if (!resultado.ok) return setErro(resultado.erro);
      setDesfazer(null);
      setAviso("Pronto, os itens voltaram para onde estavam.");
    });
  }

  function mudarBusca(valor: string) {
    setBusca(valor);
    setMostrar(POR_VEZ);
  }

  function mudarFiltro(valor: Filtro) {
    setFiltro(valor);
    setMostrar(POR_VEZ);
  }

  return (
    <>
      {/* === Seção: Busca e ordem === */}
      <div className="planilhaGom__ferramentas">
        <div className="planilhaGom__busca" role="search">
          <IconeLupa className="planilhaGom__iconeBusca" />
          <label className="somenteLeitorTela" htmlFor="busca-planilha">
            Buscar item ou joiner
          </label>
          <input
            id="busca-planilha"
            className="planilhaGom__campoBusca"
            type="search"
            value={busca}
            onChange={(evento) => mudarBusca(evento.target.value)}
            placeholder="Buscar item ou joiner…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="planilhaGom__ordem" role="group" aria-label="Ordem da planilha">
          {(["item", "joiner"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={juntarClasses("planilhaGom__botaoOrdem", ordem === opcao && "planilhaGom__botaoOrdemAtivo")}
              aria-pressed={ordem === opcao}
              onClick={() => setOrdem(opcao)}
            >
              Por {opcao}
            </button>
          ))}
        </div>
      </div>

      {/* === Seção: Filtros rápidos === */}
      <div className="planilhaGom__filtros" role="group" aria-label="Filtrar a planilha">
        {filtros.map((opcao) => {
          const etapa = FILTROS_ETAPA.some((e) => e.id === opcao.id) ? obterEtapaItem(opcao.id as EtapaItem) : null;
          return (
            <button
              key={opcao.id}
              type="button"
              className={juntarClasses("planilhaGom__filtro", filtroAtivo === opcao.id && "planilhaGom__filtroAtivo")}
              aria-pressed={filtroAtivo === opcao.id}
              onClick={() => mudarFiltro(opcao.id)}
            >
              {etapa && (
                <span className="planilhaGom__corEtapa" style={{ "--cor-etapa": etapa.cor } as CSSProperties} aria-hidden="true" />
              )}
              {opcao.rotulo}
              <span className="planilhaGom__quantos">{opcao.quantos}</span>
            </button>
          );
        })}
      </div>

      {/* === Seção: Barra dos selecionados === */}
      <div className="planilhaGom__barra" role="group" aria-label="Itens selecionados">
        <p className="planilhaGom__contagem" aria-live="polite">
          {idsSelecionados.length === 0
            ? (aviso ?? "Nenhum item selecionado")
            : `${idsSelecionados.length} ${idsSelecionados.length === 1 ? "selecionado" : "selecionados"}`}
          {idsSelecionados.length === 0 && aviso && desfazer && (
            <button type="button" className="planilhaGom__desfazer" onClick={voltarMover} disabled={desfazendo}>
              {desfazendo ? "Desfazendo…" : "Desfazer"}
            </button>
          )}
        </p>
        <div className="planilhaGom__mover">
          <label htmlFor="mover-para" className="planilhaGom__rotuloMover">
            Mover para
          </label>
          <select
            id="mover-para"
            className="seletorGom planilhaGom__destino"
            value={destino}
            onChange={(evento) => setDestino(evento.target.value)}
            disabled={idsSelecionados.length === 0 || outrasCaixas.length === 0}
          >
            <option value="">{outrasCaixas.length === 0 ? "Sem outra caixa" : "Escolher caixa"}</option>
            {outrasCaixas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="planilhaGom__botaoMover"
            onClick={mover}
            disabled={idsSelecionados.length === 0 || !destino || movendo}
          >
            {movendo ? "Movendo…" : "Mover"}
          </button>
        </div>
        {erro && (
          <p className="planilhaGom__erro" role="alert">
            {erro}
          </p>
        )}
      </div>

      {/* === Seção: Tabela === */}
      <div className="planilhaGom">
        <span className="espiralCaderno" aria-hidden="true" />
        <p className="planilhaGom__legenda">
          <span className="planilhaGom__ponto planilhaGom__pontoPago" aria-hidden="true" />
          pago
          <span className="planilhaGom__ponto planilhaGom__pontoAPagar" aria-hidden="true" />a pagar
        </p>
        <table className="planilhaGom__tabela">
          <colgroup>
            <col className="planilhaGom__colMarcar" />
            <col className="planilhaGom__colFotos" />
            <col className="planilhaGom__colNome" />
            <col className="planilhaGom__colJoiner" />
            {["valor", "compra", "inter", "taxa"].map((coluna) => (
              <col key={coluna} className="planilhaGom__colDinheiro" />
            ))}
            <col className="planilhaGom__colPeso" />
            {CATEGORIAS.map(({ id }) => (
              <col key={id} className="planilhaGom__colQtd" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <Marcar
                  marcado={todosVisiveisMarcados}
                  parcial={algumVisivelMarcado && !todosVisiveisMarcados}
                  aoMudar={alternarTodos}
                  desabilitado={visiveis.length === 0}
                  rotulo="Selecionar todos os itens"
                />
              </th>
              <th scope="col">
                <IconeCamera tamanho={15} />
                <span className="somenteLeitorTela">Fotos</span>
              </th>
              <th scope="col" className="planilhaGom__alinharEsquerda">
                Nome do item
              </th>
              <th scope="col" className="planilhaGom__alinharEsquerda">
                Joiner
              </th>
              <th scope="col">Valor</th>
              <th scope="col">Compra</th>
              <th scope="col">Inter</th>
              <th scope="col">Taxa</th>
              <th scope="col">
                Peso <span className="planilhaGom__unidade">(kg)</span>
              </th>
              {CATEGORIAS.map((categoria) => (
                <th key={categoria.id} scope="col">
                  <abbr title={categoria.rotulo}>{categoria.sigla === "ITEM" ? "Item" : categoria.sigla}</abbr>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {exibidos.map((registro) => {
              const marcado = selecionados.has(registro.id);
              const celulasInicio = (
                <>
                  <td className="planilhaGom__celulaMarcar">
                    <Marcar marcado={marcado} aoMudar={() => alternar(registro.id)} rotulo={`Selecionar ${registro.nome}`} />
                  </td>
                  <td className="planilhaGom__celulaFotos">
                    <button
                      type="button"
                      className={juntarClasses("botaoCamera", registro.fotoId && "botaoCamera__miniatura")}
                      onClick={() => setFotosDe(registro)}
                      disabled={!temFoto(registro)}
                      aria-label={temFoto(registro) ? `Ver fotos de ${registro.nome}` : `${registro.nome} ainda sem foto`}
                      title={temFoto(registro) ? "Ver fotos" : "Sem foto ainda"}
                    >
                      {registro.fotoId ? (
                        <CldImage src={registro.fotoId} alt="" width={64} height={64} crop="fill" gravity="auto" />
                      ) : (
                        <IconeCamera tamanho={15} />
                      )}
                    </button>
                  </td>
                </>
              );

              if (ehGrupo(registro)) {
                return (
                  <Fragment key={registro.id}>
                    <tr className={juntarClasses("planilhaGom__linhaSet", marcado && "planilhaGom__selecionada")}>
                      {celulasInicio}
                      <th scope="row" colSpan={2} className="planilhaGom__nome planilhaGom__alinharEsquerda">
                        <span className="planilhaGom__celulaNome">
                          {naWarehouse && <BolinhaEtapa situacao={registro.situacao} />}
                          <span className="planilhaGom__seloSet">SET</span>
                          <span className="planilhaGom__nomeTexto" title={registro.nome}>
                            {registro.nome}
                          </span>
                          <span className="planilhaGom__pessoas">
                            · {registro.partes.length} {registro.partes.length === 1 ? "joiner" : "joiners"}
                          </span>
                          <BotaoEditar nome={registro.nome} aoClicar={() => setEditando(registro)} />
                        </span>
                      </th>
                      <td data-rotulo="Valor" />
                      <td data-rotulo="Compra">{formatarDinheiro(registro.compra)}</td>
                      <td data-rotulo="Inter" />
                      <td data-rotulo="Taxa" />
                      <td data-rotulo="Peso (kg)">{formatarKg(registro.pesoKg)}</td>
                      <CelulasQuantidade quantidades={registro.quantidades} />
                    </tr>
                    {registro.partes.map((parte) => (
                      <LinhaParte key={parte.id} parte={parte} marcado={marcado} />
                    ))}
                  </Fragment>
                );
              }

              const parte = registro.partes[0];
              return (
                <tr key={registro.id} className={juntarClasses(marcado && "planilhaGom__selecionada")}>
                  {celulasInicio}
                  <th scope="row" className="planilhaGom__nome planilhaGom__alinharEsquerda">
                    <span className="planilhaGom__celulaNome">
                      {naWarehouse && <BolinhaEtapa situacao={registro.situacao} />}
                      <span className="planilhaGom__nomeTexto" title={registro.nome}>
                        {registro.nome}
                      </span>
                      <BotaoEditar nome={registro.nome} aoClicar={() => setEditando(registro)} />
                    </span>
                  </th>
                  <td data-rotulo="Joiner" className="planilhaGom__joiner planilhaGom__alinharEsquerda">
                    {parte ? `@${parte.user}` : <span className="planilhaGom__semDono">sem dono</span>}
                  </td>
                  <td data-rotulo="Valor">
                    {parte ? (
                      <ValorPago valor={parte.venda} pago={parte.vendaPago} />
                    ) : (
                      formatarDinheiro(registro.precoSemDono)
                    )}
                  </td>
                  <td data-rotulo="Compra">{formatarDinheiro(registro.compra)}</td>
                  <td data-rotulo="Inter">{parte ? <ValorPago valor={parte.inter} pago={parte.interPago} /> : <Vazio />}</td>
                  <td data-rotulo="Taxa">{parte ? <ValorPago valor={parte.taxa} pago={parte.taxaPago} /> : <Vazio />}</td>
                  <td data-rotulo="Peso (kg)">{formatarKg(registro.pesoKg)}</td>
                  <CelulasQuantidade quantidades={registro.quantidades} />
                </tr>
              );
            })}

            {visiveis.length === 0 && (
              <tr>
                <td colSpan={14} className="planilhaGom__nada" aria-live="polite">
                  {registros.length === 0
                    ? "A caixa ainda não tem itens. Use “+ Adicionar item” para começar."
                    : termo
                      ? "Nada com esse nome. Confira a escrita ou tente outra palavra."
                      : "Nenhum item neste filtro."}
                </td>
              </tr>
            )}
          </tbody>

          {visiveis.length > 0 && (
            <tfoot>
              <tr className="planilhaGom__linhaTotal">
                <td colSpan={2} className="planilhaGom__celulaVazia" />
                <th scope="row" colSpan={2} className="planilhaGom__alinharEsquerda">
                  Total{termo && " da busca"}
                </th>
                <td data-rotulo="Valor">
                  <Dinheiro valor={total.venda} />
                </td>
                <td data-rotulo="Compra">
                  <Dinheiro valor={total.compra} />
                </td>
                <td data-rotulo="Inter">
                  <Dinheiro valor={somarPartes(visiveis, "inter")} />
                </td>
                <td data-rotulo="Taxa">
                  <Dinheiro valor={somarPartes(visiveis, "taxa")} />
                </td>
                <td data-rotulo="Peso (kg)">{formatarKg(total.peso)}</td>
                <CelulasQuantidade quantidades={total.quantidades} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {restantes > 0 && (
        <button type="button" className="botao botao__contorno planilhaGom__verMais" onClick={() => setMostrar((n) => n + POR_VEZ)}>
          Ver mais {Math.min(restantes, POR_VEZ)}
          {restantes > POR_VEZ && ` de ${restantes}`}
        </button>
      )}

      {editando && (
        <JanelaItem
          key={editando.id}
          caixa={caixa}
          caixas={caixas}
          joiners={joiners}
          registro={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={mostrarAviso}
        />
      )}

      {fotosDe && <JanelaFotos item={fotosDe} aoFechar={() => setFotosDe(null)} />}
    </>
  );
}

// === Seção: Peças da tabela ===
// Bolinha com a cor da etapa; o nome da etapa fica no texto escondido e na dica ao passar o mouse
function BolinhaEtapa({ situacao }: { situacao: EtapaItem }) {
  const etapa = obterEtapaItem(situacao);
  return (
    <span className="planilhaGom__corEtapa" style={{ "--cor-etapa": etapa.cor } as CSSProperties} title={etapa.rotulo}>
      <span className="somenteLeitorTela">{etapa.rotulo}: </span>
    </span>
  );
}

function LinhaParte({ parte, marcado }: { parte: ParteGom; marcado: boolean }) {
  return (
    <tr className={juntarClasses("planilhaGom__linhaParte", marcado && "planilhaGom__selecionada")}>
      <td className="planilhaGom__celulaMarcar" />
      <td className="planilhaGom__celulaFotos" />
      <td className="planilhaGom__membro planilhaGom__alinharEsquerda">{parte.membro ?? <Vazio />}</td>
      <td data-rotulo="Joiner" className="planilhaGom__joiner planilhaGom__alinharEsquerda">
        @{parte.user}
      </td>
      <td data-rotulo="Valor">
        <ValorPago valor={parte.venda} pago={parte.vendaPago} />
      </td>
      <td className="planilhaGom__celulaVazia" />
      <td data-rotulo="Inter">
        <ValorPago valor={parte.inter} pago={parte.interPago} />
      </td>
      <td data-rotulo="Taxa">
        <ValorPago valor={parte.taxa} pago={parte.taxaPago} />
      </td>
      <td className="planilhaGom__celulaVazia" />
      <CelulasQuantidade quantidades={parte.quantidades} />
    </tr>
  );
}

function CelulasQuantidade({ quantidades }: { quantidades: Quantidades }) {
  return CATEGORIAS.map((categoria) => (
    <td
      key={categoria.id}
      data-rotulo={categoria.sigla}
      className={juntarClasses("planilhaGom__qtd", quantidades[categoria.id] === 0 && "planilhaGom__zero")}
    >
      {quantidades[categoria.id]}
    </td>
  ));
}

// Verde = pago, vermelho = a pagar (o texto escondido diz o mesmo para leitores de tela)
function ValorPago({ valor, pago }: { valor: number | null; pago: boolean }) {
  if (valor === null) return <Vazio rotulo="A definir" />;
  return (
    <span className={pago ? "planilhaGom__pago" : "planilhaGom__aPagar"}>
      <Dinheiro valor={valor} />
      <span className="somenteLeitorTela">{pago ? " (pago)" : " (a pagar)"}</span>
    </span>
  );
}

function Vazio({ rotulo = "Vazio" }: { rotulo?: string }) {
  return (
    <span className="planilhaGom__vazio" aria-label={rotulo}>
      -
    </span>
  );
}

function formatarDinheiro(valor: number | null) {
  return valor === null ? <Vazio /> : <Dinheiro valor={valor} />;
}

// "R$" e o número separados: com valores muito altos, o número desce para a linha de baixo
// em vez de invadir a coluna vizinha
const formatadorValor = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatadorKg = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function Dinheiro({ valor }: { valor: number }) {
  return (
    <span className="planilhaGom__dinheiro">
      <span className="planilhaGom__moeda">R$</span>
      <wbr />
      <span className="planilhaGom__numero">{formatadorValor.format(valor)}</span>
    </span>
  );
}

function formatarKg(kg: number | null) {
  return kg === null ? <Vazio /> : formatadorKg.format(kg);
}

// === Seção: Caixa de marcar ===
// A área de toque é a célula inteira; a caixa desenhada fica no meio
type PropsMarcar = { marcado: boolean; parcial?: boolean; aoMudar: () => void; rotulo: string; desabilitado?: boolean };

function Marcar({ marcado, parcial = false, aoMudar, rotulo, desabilitado }: PropsMarcar) {
  return (
    <label className="planilhaGom__areaMarcar">
      <input
        type="checkbox"
        className="planilhaGom__marcar"
        checked={marcado}
        ref={(caixa) => {
          if (caixa) caixa.indeterminate = parcial;
        }}
        onChange={aoMudar}
        disabled={desabilitado}
        aria-label={rotulo}
      />
    </label>
  );
}

function somarPartes(registros: RegistroGom[], campo: "inter" | "taxa") {
  return registros.reduce((total, r) => total + r.partes.reduce((soma, p) => soma + (p[campo] ?? 0), 0), 0);
}

function BotaoEditar({ nome, aoClicar }: { nome: string; aoClicar: () => void }) {
  return (
    <button type="button" className="planilhaGom__editar" onClick={aoClicar} aria-label={`Editar ${nome}`} title="Editar item">
      <IconeLapis />
    </button>
  );
}
