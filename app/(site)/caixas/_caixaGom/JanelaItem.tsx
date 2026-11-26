"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { IconeFechar, IconeLapis } from "@/componentes/Icones";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import JanelaSenhaProvisoria from "@/componentes/JanelaSenhaProvisoria";
import { type ResultadoConta, criarContaJoiner } from "@/lib/acoesContas";
import { juntarClasses } from "@/lib/classes";
import { chamar } from "@/lib/conexao";
import { type EtapaItem, ETAPAS_ITEM, obterEtapaCaixa } from "@/lib/etapas";
import { formatarReais } from "@/lib/formatacao";
import {
  type CaixaGom,
  CATEGORIAS,
  type Categoria,
  type JoinerOpcao,
  QUANTIDADES_ZERADAS,
  type Quantidades,
  type RegistroGom,
  lerNumero,
} from "@/lib/planilhaCaixa";
import { useAvisoAoSair } from "@/lib/useAvisoAoSair";
import { type DadosParte, criarItem, descartarFotos, editarItem, excluirItem } from "../acoes";
import { Campo, CampoFoto, Contador, EntradaReais } from "./CamposJanela";
import "@/estilos/componentes/JanelaGom.css";

// Com a caixa na warehouse o item pode estar nestas etapas; depois ele acompanha a caixa
const ETAPAS_NA_WAREHOUSE: EtapaItem[] = ["esperando", "comprado", "warehouse"];

const SEM_CONTA = "Nenhuma conta com esse user.";

type Linha = DadosParte & { chave: number };

type EstadoRascunhoItem = {
  caixaId: string;
  grupo: string;
  situacao: EtapaItem;
  nome: string;
  fotoId: string | null;
  proofWhId: string | null;
  quantidades: Quantidades;
  peso: string;
  compra: string;
  tipo: "individual" | "set";
  linhas: Linha[];
};

const formatadorValor = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatadorPeso = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

function campoValor(valor: number | null) {
  return valor === null ? "" : formatadorValor.format(valor);
}

function novaLinha(chave: number): Linha {
  return {
    chave,
    user: "",
    membro: "",
    valor: "",
    inter: "",
    taxa: "",
    vendaPago: false,
    interPago: false,
    taxaPago: false,
    quantidades: { ...QUANTIDADES_ZERADAS },
  };
}

function limparUser(texto: string) {
  return texto.trim().replace(/^@/, "").toLowerCase();
}

function lerRascunhoItem(chave: string): EstadoRascunhoItem | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.sessionStorage.getItem(chave);
    if (!bruto) return null;
    return JSON.parse(bruto) as EstadoRascunhoItem;
  } catch {
    return null;
  }
}

function gravarRascunhoItem(chave: string, dados: EstadoRascunhoItem) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(chave, JSON.stringify(dados));
  } catch {
    // Ignora falhas de armazenamento
  }
}

function limparRascunhoItem(chave: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(chave);
  } catch {
    // Ignora falhas de armazenamento
  }
}

// === Seção: Estado inicial (vazio no "Novo item"; o registro no "Editar item") ===
function estadoInicial(caixa: CaixaGom, registro?: RegistroGom): EstadoRascunhoItem {
  if (!registro) {
    return {
      caixaId: String(caixa.id),
      grupo: "",
      situacao: "warehouse" as EtapaItem,
      nome: "",
      fotoId: null as string | null,
      proofWhId: null as string | null,
      quantidades: { ...QUANTIDADES_ZERADAS },
      peso: "",
      compra: "",
      tipo: "individual" as "individual" | "set",
      linhas: [novaLinha(0)],
    };
  }

  // Item sem dono: a linha fica sem joiner, com o preço do anúncio no valor
  const linhas: Linha[] = registro.semDono
    ? [
        {
          ...novaLinha(0),
          membro: registro.membro ?? "",
          valor: campoValor(registro.precoSemDono),
        },
      ]
    : registro.partes.map((p, indice) => ({
        chave: indice,
        id: p.id,
        user: `@${p.user}`,
        membro: p.membro ?? "",
        valor: campoValor(p.venda),
        inter: campoValor(p.inter),
        taxa: campoValor(p.taxa),
        vendaPago: p.vendaPago,
        interPago: p.interPago,
        taxaPago: p.taxaPago,
        quantidades: { ...p.quantidades },
      }));

  return {
    caixaId: String(caixa.id),
    grupo: registro.grupo ?? "",
    situacao: registro.situacao,
    nome: registro.nome,
    fotoId: registro.fotoId,
    proofWhId: registro.proofWhId,
    quantidades: { ...registro.quantidades },
    peso: registro.pesoKg === null ? "" : formatadorPeso.format(registro.pesoKg),
    compra: campoValor(registro.compra),
    tipo:
      registro.tipo === "set" || registro.partes.length > 1
        ? ("set" as const)
        : ("individual" as const),
    linhas: linhas.length > 0 ? linhas : [novaLinha(0)],
  };
}

type PropsJanelaItem = {
  caixa: CaixaGom;
  caixas: CaixaGom[];
  joiners: JoinerOpcao[];
  // Com registro, a janela edita; sem, cria um item novo
  registro?: RegistroGom;
  aoFechar: () => void;
  // Texto do aviso que aparece na tela depois de salvar ou excluir
  aoSalvar: (aviso: string) => void;
};

// === Seção: Janela "Novo item" / "Editar item" ===
// Fecha no X, no "Cancelar" ou no Esc; com algo mudado, pergunta antes de descartar.
// Clicar fora não fecha (para não perder o que já foi preenchido).
export default function JanelaItem({
  caixa,
  caixas,
  joiners: joinersIniciais,
  registro,
  aoFechar,
  aoSalvar,
}: PropsJanelaItem) {
  const editando = Boolean(registro);
  const chaveRascunho = registro
    ? `lucky-cegs:rascunho:item:editar:${registro.id}`
    : `lucky-cegs:rascunho:item:novo:${caixa.id}`;

  const referencia = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const idLista = useId();

  const [inicial] = useState<EstadoRascunhoItem>(() => estadoInicial(caixa, registro));
  const [rascunho] = useState<EstadoRascunhoItem>(() => lerRascunhoItem(chaveRascunho) ?? inicial);

  const [caixaId, setCaixaId] = useState(rascunho.caixaId);
  const [grupo, setGrupo] = useState(rascunho.grupo);
  const [situacao, setSituacao] = useState<EtapaItem>(rascunho.situacao);
  const [nome, setNome] = useState(rascunho.nome);
  const [fotoId, setFotoId] = useState(rascunho.fotoId);
  const [proofWhId, setProofWhId] = useState(rascunho.proofWhId);
  const [quantidades, setQuantidades] = useState<Quantidades>(rascunho.quantidades);
  const [peso, setPeso] = useState(rascunho.peso);
  const [compra, setCompra] = useState(rascunho.compra);
  const [tipo, setTipo] = useState(rascunho.tipo);
  const [linhas, setLinhas] = useState<Linha[]>(rascunho.linhas);

  // Cada linha de joiner ganha uma chave nova (a lista muda de tamanho no set)
  const maiorChave = rascunho.linhas.reduce((max, l) => Math.max(max, l.chave), 0);
  const ultimaChave = useRef(Math.max(maiorChave, rascunho.linhas.length));

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const [descartando, setDescartando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [apagando, iniciarExclusao] = useTransition();

  // Fotos que subiram nesta janela: as que não ficarem no item são apagadas do Cloudinary ao fechar
  const fotosEnviadas = useRef(new Set<string>());
  const salvou = useRef(false);

  // Contas criadas por aqui entram na lista na hora
  const [joiners, setJoiners] = useState(joinersIniciais);
  const [contaCriada, setContaCriada] = useState<Extract<ResultadoConta, { ok: true }> | null>(null);
  const [criandoConta, iniciarConta] = useTransition();

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  // Depois de mostrar os erros, leva o foco ao primeiro campo com problema
  useEffect(() => {
    if (Object.keys(erros).length === 0) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [erros]);

  const caixaEscolhida = caixas.find((c) => String(c.id) === caixaId) ?? caixa;
  const naWarehouse = caixaEscolhida.situacao === "warehouse";
  const situacaoFinal = naWarehouse
    ? ETAPAS_NA_WAREHOUSE.includes(situacao)
      ? situacao
      : "warehouse"
    : caixaEscolhida.situacao;
  const linhasUsadas = tipo === "set" ? linhas : linhas.slice(0, 1);

  // Lucro = valores dos joiners menos a compra
  const valores = linhasUsadas.map((linha) => lerNumero(linha.valor));
  const valorCompra = lerNumero(compra);
  const contaValida = [...valores, valorCompra].every((valor) => !Number.isNaN(valor));
  const lucro =
    valores.reduce<number>((total, valor) => total + (valor ?? 0), 0) - (valorCompra ?? 0);

  const categoriasDoSet = CATEGORIAS.filter(({ id }) => quantidades[id] > 0);

  const atual: EstadoRascunhoItem = {
    caixaId,
    grupo,
    situacao,
    nome,
    fotoId,
    proofWhId,
    quantidades,
    peso,
    compra,
    tipo,
    linhas,
  };
  const alterado = JSON.stringify(atual) !== JSON.stringify(inicial);
  useAvisoAoSair(alterado);

  useEffect(() => {
    if (salvou.current) return;
    if (alterado) {
      gravarRascunhoItem(chaveRascunho, atual);
    } else {
      limparRascunhoItem(chaveRascunho);
    }
  });

  function mudarFoto(id: string | null) {
    if (id) fotosEnviadas.current.add(id);
    setFotoId(id);
  }

  function mudarProof(id: string | null) {
    if (id) fotosEnviadas.current.add(id);
    setProofWhId(id);
  }

  function criarConta(texto: string, chaveErro: string) {
    iniciarConta(async () => {
      const resultado = await chamar(() => criarContaJoiner(texto));
      if (!resultado.ok) {
        return setErros((anteriores) => ({ ...anteriores, [chaveErro]: resultado.erro }));
      }
      setJoiners((anteriores) => [
        ...anteriores,
        { id: resultado.user, user: resultado.user, nome: resultado.user },
      ]);
      setErros((anteriores) =>
        Object.fromEntries(Object.entries(anteriores).filter(([c]) => c !== chaveErro)),
      );
      setContaCriada(resultado);
    });
  }

  // Fecha e avisa a tela na hora: o evento "close" do navegador pode se perder enquanto a página atualiza
  const jaFechou = useRef(false);
  function fechar() {
    limparRascunhoItem(chaveRascunho);
    referencia.current?.close();
    aoFecharJanela();
  }

  function aoFecharJanela() {
    if (jaFechou.current) return;
    jaFechou.current = true;
    limparRascunhoItem(chaveRascunho);
    const usadas = salvou.current
      ? [fotoId, proofWhId]
      : [inicial.fotoId, inicial.proofWhId];
    const sobrando = [...fotosEnviadas.current].filter((id) => !usadas.includes(id));
    if (sobrando.length > 0) void descartarFotos(sobrando);
    aoFechar();
  }

  // Outro joiner na linha: o pago era da pessoa anterior, então desmarca (voltar ao joiner original recupera)
  function mudarJoiner(linha: Linha, texto: string) {
    const original = inicial.linhas.find((l) => l.chave === linha.chave);
    const mesmaPessoa = original && limparUser(original.user) === limparUser(texto);
    atualizarLinha(linha.chave, {
      user: texto,
      vendaPago: mesmaPessoa ? original.vendaPago : false,
      interPago: mesmaPessoa ? original.interPago : false,
      taxaPago: mesmaPessoa ? original.taxaPago : false,
    });
  }

  function pedirParaFechar() {
    if (salvando || apagando) return;
    if (alterado) setDescartando(true);
    else fechar();
  }

  function atualizarLinha(chave: number, mudancas: Partial<Linha>) {
    setLinhas((anteriores) =>
      anteriores.map((linha) => (linha.chave === chave ? { ...linha, ...mudancas } : linha)),
    );
  }

  function adicionarLinha() {
    ultimaChave.current += 1;
    const nova = novaLinha(ultimaChave.current);
    setLinhas((anteriores) => [...anteriores, nova]);
  }

  function escolherTipo(novo: "individual" | "set") {
    setTipo(novo);
    if (novo === "set" && linhas.length < 2) adicionarLinha();
  }

  function conferir() {
    const encontrados: Record<string, string> = {};
    if (!nome.trim()) encontrados.nome = "Escreva o nome do item ou do set.";
    if (Number.isNaN(lerNumero(peso))) encontrados.peso = "Use só números, como 0,250.";
    if (Number.isNaN(valorCompra)) encontrados.compra = "Use só números, como 45,90.";
    linhasUsadas.forEach((linha, indice) => {
      const chave = `partes.${indice}`;
      const user = limparUser(linha.user);
      if (!user && tipo === "set") encontrados[`${chave}.user`] = "Escolha o joiner.";
      if (user && !joiners.some((j) => j.user === user)) encontrados[`${chave}.user`] = SEM_CONTA;
      if (Number.isNaN(lerNumero(linha.valor))) {
        encontrados[`${chave}.valor`] = "Valor: use só números, como 45,90.";
      }
      if (Number.isNaN(lerNumero(linha.inter))) {
        encontrados[`${chave}.inter`] = "Inter: use só números.";
      }
      if (Number.isNaN(lerNumero(linha.taxa))) {
        encontrados[`${chave}.taxa`] = "Taxa: use só números.";
      }
    });
    return encontrados;
  }

  function salvar() {
    setErroGeral(null);
    const encontrados = conferir();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    const dados = {
      caixaId: Number(caixaId),
      grupo,
      situacao: situacaoFinal,
      nome,
      fotoId,
      proofWhId,
      quantidades,
      peso,
      compra,
      tipo,
      partes: linhasUsadas.map((linha) => ({
        id: linha.id,
        user: linha.user,
        membro: linha.membro,
        valor: linha.valor,
        inter: linha.inter,
        taxa: linha.taxa,
        vendaPago: linha.vendaPago,
        interPago: linha.interPago,
        taxaPago: linha.taxaPago,
        quantidades: linha.quantidades,
      })),
    };

    iniciar(async () => {
      const resultado = registro
        ? await chamar(() => editarItem(registro.id, dados))
        : await chamar(() => criarItem(dados));
      if (resultado.ok) {
        salvou.current = true;
        limparRascunhoItem(chaveRascunho);
        const outraCaixa = caixaEscolhida.id === caixa.id ? "" : ` na ${caixaEscolhida.nome}`;
        aoSalvar(`${nome.trim()} foi ${editando ? "atualizado" : "salvo"}${outraCaixa}.`);
        return fechar();
      }
      setErros(resultado.erros);
      setErroGeral(resultado.erro ?? "Confira os campos marcados.");
    });
  }

  function excluir() {
    if (!registro) return;
    setErroExcluir(null);
    iniciarExclusao(async () => {
      const resultado = await chamar(() => excluirItem(registro.id));
      if (!resultado.ok) return setErroExcluir(resultado.erro);
      salvou.current = true;
      limparRascunhoItem(chaveRascunho);
      aoSalvar(`${registro.nome} foi excluído.`);
      fechar();
    });
  }

  // Liga um campo à mensagem de erro dele; mexer no campo apaga o erro
  function propsErro(chave: string, id: string, descricao?: string) {
    return {
      id,
      "data-erro": chave,
      "aria-invalid": Boolean(erros[chave]),
      "aria-describedby": erros[chave] ? (descricao ?? `${id}-erro`) : undefined,
    };
  }

  const joinersDoItem = registro?.partes ?? [];
  const pagantes = joinersDoItem.filter((p) => p.vendaPago || p.interPago || p.taxaPago);

  return (
    <dialog
      ref={referencia}
      className="janelaGom"
      aria-labelledby="titulo-janela-item"
      onClose={aoFecharJanela}
      onCancel={(evento) => {
        evento.preventDefault();
        pedirParaFechar();
      }}
    >
      <form
        ref={formulario}
        className="janelaGom__conteudo"
        noValidate
        onInput={(evento) => {
          const chave = (evento.target as HTMLElement).dataset.erro;
          if (chave && erros[chave]) {
            setErros((anteriores) =>
              Object.fromEntries(Object.entries(anteriores).filter(([c]) => c !== chave)),
            );
          }
        }}
        onSubmit={(evento) => {
          evento.preventDefault();
          salvar();
        }}
      >
        <div className="janelaGom__topo">
          <h2 id="titulo-janela-item" className="janelaGom__titulo">
            {editando ? "EDITAR ITEM" : "NOVO ITEM"}
          </h2>
          <button
            type="button"
            className="janelaGom__fechar"
            onClick={pedirParaFechar}
            disabled={salvando || apagando}
            aria-label="Fechar sem salvar"
          >
            <IconeFechar tamanho={22} aria-hidden="true" />
          </button>
        </div>

        {registro && (
          <p className="janelaGom__editando">
            <IconeLapis tamanho={15} aria-hidden="true" />
            Editando um registro da {caixa.nome} · alterado por último em{" "}
            {formatadorData.format(registro.atualizadoEm)}
          </p>
        )}

        {/* === Seção: Caixa, grupo e situação === */}
        <div className="janelaGom__linha janelaGom__tres">
          <Campo rotulo="Caixa" id="item-caixa" erro={erros.caixaId}>
            <select
              {...propsErro("caixaId", "item-caixa")}
              className="seletorGom janelaGom__entrada"
              value={caixaId}
              onChange={(evento) => setCaixaId(evento.target.value)}
            >
              {caixas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Grupo" id="item-grupo">
            <input
              id="item-grupo"
              className="janelaGom__entrada"
              value={grupo}
              onChange={(evento) => setGrupo(evento.target.value)}
              placeholder="Ex.: BABYMONSTER…"
              autoComplete="off"
              maxLength={120}
            />
          </Campo>
          <Campo rotulo="Situação" id="item-situacao" erro={erros.situacao}>
            <select
              {...propsErro("situacao", "item-situacao")}
              className="seletorGom janelaGom__entrada"
              value={situacaoFinal}
              onChange={(evento) => setSituacao(evento.target.value as EtapaItem)}
              disabled={!naWarehouse}
              title={
                naWarehouse ? undefined : "Fora da warehouse, o item acompanha a etapa da caixa"
              }
            >
              {naWarehouse ? (
                ETAPAS_ITEM.filter((etapa) => ETAPAS_NA_WAREHOUSE.includes(etapa.id)).map(
                  (etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.rotulo}
                    </option>
                  ),
                )
              ) : (
                <option value={caixaEscolhida.situacao}>
                  {obterEtapaCaixa(caixaEscolhida.situacao).rotulo}
                </option>
              )}
            </select>
          </Campo>
        </div>

        {/* === Seção: Nome === */}
        <div className="janelaGom__linha">
          <Campo rotulo="Nome do item ou set" id="item-nome" erro={erros.nome}>
            <input
              {...propsErro("nome", "item-nome")}
              className="janelaGom__entrada"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: Harua mom units 7-set…"
              autoComplete="off"
              maxLength={120}
            />
          </Campo>
        </div>

        {/* === Seção: Fotos === */}
        <div className="janelaGom__linha janelaGom__fotos">
          <CampoFoto rotulo="Foto do item" pasta="itens" fotoId={fotoId} aoMudar={mudarFoto} />
          <CampoFoto
            rotulo="Proof da warehouse"
            pasta="warehouse"
            fotoId={proofWhId}
            aoMudar={mudarProof}
          />
          {erros.fotos && (
            <p className="janelaGom__erro janelaGom__inteira">{erros.fotos}</p>
          )}
        </div>

        {/* === Seção: Quantidades === */}
        <fieldset className="janelaGom__linha janelaGom__grupoCampos">
          <legend className="janelaGom__rotulo">
            Quantidade por categoria{tipo === "set" && " (total do set)"}
          </legend>
          <div className="janelaGom__quantidades">
            {CATEGORIAS.map((categoria) => (
              <Contador
                key={categoria.id}
                id={`item-qtd-${categoria.id}`}
                rotulo={categoria.rotulo}
                valor={quantidades[categoria.id]}
                aoMudar={(valor) =>
                  setQuantidades((anteriores) => ({ ...anteriores, [categoria.id]: valor }))
                }
              />
            ))}
          </div>
          {erros.quantidades && <p className="janelaGom__erro">{erros.quantidades}</p>}
        </fieldset>

        {/* === Seção: Peso, compra e lucro === */}
        <div className="janelaGom__linha janelaGom__tres">
          <Campo rotulo="Peso (kg)" id="item-peso" erro={erros.peso}>
            <input
              {...propsErro("peso", "item-peso")}
              className="janelaGom__entrada janelaGom__entradaAlta"
              value={peso}
              onChange={(evento) => setPeso(evento.target.value)}
              inputMode="decimal"
              placeholder="0,000"
              autoComplete="off"
            />
          </Campo>
          <Campo rotulo="Valor de compra" id="item-compra" erro={erros.compra}>
            <EntradaReais
              {...propsErro("compra", "item-compra")}
              valor={compra}
              aoMudar={setCompra}
              alta
            />
          </Campo>
          <div className="janelaGom__campo">
            <span className="janelaGom__rotulo" id="item-lucro-rotulo">
              Lucro
            </span>
            <output
              className={juntarClasses(
                "janelaGom__lucro",
                contaValida && lucro < 0 && "janelaGom__lucroNegativo",
              )}
              aria-labelledby="item-lucro-rotulo"
              aria-live="polite"
            >
              {contaValida ? formatarReais(lucro) : "Confira os valores"}
            </output>
          </div>
        </div>

        {/* === Seção: Individual ou set === */}
        <div className="janelaGom__tipo" role="group" aria-label="Tipo do item">
          {(
            [
              ["individual", "Item individual"],
              ["set", "Set"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              className={juntarClasses(
                "janelaGom__botaoTipo",
                tipo === valor && "janelaGom__botaoTipoAtivo",
              )}
              aria-pressed={tipo === valor}
              onClick={() => escolherTipo(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
        {erros.partes && <p className="janelaGom__erro">{erros.partes}</p>}

        {/* === Seção: Joiners (uma linha por pessoa; a caixinha ao lado de cada valor marca o pago) === */}
        <datalist id={idLista}>
          {joiners.map((joiner) => (
            <option key={joiner.id} value={`@${joiner.user}`}>
              {joiner.nome}
            </option>
          ))}
        </datalist>

        <div className={juntarClasses("janelaGom__joiners", tipo === "set" && "janelaGom__joinersSet")}>
          <div className="janelaGom__cabecalhoJoiners" aria-hidden="true">
            <span>Joiner</span>
            <span>Membro</span>
            <span>Valor</span>
            <span>Inter</span>
            <span>Taxa</span>
          </div>

          {linhasUsadas.map((linha, indice) => {
            const chave = `partes.${indice}`;
            const prefixo = `item-${linha.chave}`;
            const idErros = `${prefixo}-erros`;
            const errosLinha = ["user", "valor", "inter", "taxa", "quantidades"]
              .map((campo) => erros[`${chave}.${campo}`])
              .filter(Boolean);
            const numero = tipo === "set" ? ` ${indice + 1}` : "";

            return (
              <div key={linha.chave} className="janelaGom__joiner">
                <div className="janelaGom__linhaJoiner">
                  <span className="janelaGom__celula janelaGom__celulaJoiner">
                    <span className="janelaGom__rotuloCelula" aria-hidden="true">
                      Joiner{numero}
                    </span>
                    <input
                      {...propsErro(`${chave}.user`, `${prefixo}-user`, idErros)}
                      className="janelaGom__entrada janelaGom__entradaLinha"
                      value={linha.user}
                      onChange={(evento) => mudarJoiner(linha, evento.target.value)}
                      list={idLista}
                      placeholder="@user"
                      aria-label={`Joiner${numero}`}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </span>
                  <span className="janelaGom__celula">
                    <span className="janelaGom__rotuloCelula" aria-hidden="true">
                      Membro
                    </span>
                    <input
                      id={`${prefixo}-membro`}
                      className="janelaGom__entrada janelaGom__entradaLinha"
                      value={linha.membro}
                      onChange={(evento) => atualizarLinha(linha.chave, { membro: evento.target.value })}
                      placeholder="Ex.: Harua…"
                      aria-label={`Membro${numero}`}
                      autoComplete="off"
                      maxLength={120}
                    />
                  </span>
                  {(
                    [
                      ["valor", "vendaPago", "Valor"],
                      ["inter", "interPago", "Inter"],
                      ["taxa", "taxaPago", "Taxa"],
                    ] as const
                  ).map(([campo, pago, rotulo]) => {
                    const preenchido = Boolean(linha[campo].trim());
                    return (
                      <span key={campo} className="janelaGom__celula">
                        <span className="janelaGom__rotuloCelula" aria-hidden="true">
                          {rotulo}
                        </span>
                        <span className="janelaGom__valorPago">
                          <EntradaReais
                            {...propsErro(`${chave}.${campo}`, `${prefixo}-${campo}`, idErros)}
                            valor={linha[campo]}
                            aoMudar={(valor) => atualizarLinha(linha.chave, { [campo]: valor })}
                            rotulo={`${rotulo}${numero}`}
                            compacto
                          />
                          <input
                            type="checkbox"
                            className="janelaGom__pago"
                            checked={preenchido && linha[pago]}
                            disabled={!preenchido}
                            onChange={(evento) =>
                              atualizarLinha(linha.chave, { [pago]: evento.target.checked })
                            }
                            aria-label={`${rotulo}${numero} pago`}
                            title={
                              preenchido
                                ? "Marcar como pago"
                                : "Lance o valor para marcar como pago"
                            }
                          />
                        </span>
                      </span>
                    );
                  })}
                  {tipo === "set" && (
                    <button
                      type="button"
                      className="janelaGom__tirarJoiner"
                      onClick={() =>
                        setLinhas((anteriores) => anteriores.filter((l) => l.chave !== linha.chave))
                      }
                      disabled={linhas.length <= 2}
                      aria-label={`Tirar o joiner${numero}`}
                      title={
                        linhas.length <= 2
                          ? "Um set precisa de pelo menos 2 joiners"
                          : "Tirar este joiner"
                      }
                    >
                      <IconeFechar tamanho={16} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {erros[`${chave}.user`] === SEM_CONTA && (
                  <button
                    type="button"
                    className="janelaGom__criarConta"
                    onClick={() => criarConta(linha.user, `${chave}.user`)}
                    disabled={criandoConta}
                  >
                    {criandoConta
                      ? "Criando conta…"
                      : `Criar conta para @${limparUser(linha.user)}`}
                  </button>
                )}

                {errosLinha.length > 0 && (
                  <p id={idErros} className="janelaGom__erro">
                    {errosLinha.join(" ")}
                  </p>
                )}

                {/* Quanto do set fica com esta pessoa */}
                {tipo === "set" && categoriasDoSet.length > 0 && (
                  <div
                    className="janelaGom__ficaCom"
                    role="group"
                    aria-label={`Quanto fica com o joiner${numero}`}
                  >
                    <span className="janelaGom__ficaComRotulo" aria-hidden="true">
                      Fica com:
                    </span>
                    {categoriasDoSet.map((categoria) => (
                      <Contador
                        key={categoria.id}
                        id={`${prefixo}-qtd-${categoria.id}`}
                        rotulo={categoria.rotulo}
                        sigla={categoria.sigla}
                        valor={linha.quantidades[categoria.id]}
                        aoMudar={(valor) =>
                          atualizarLinha(linha.chave, {
                            quantidades: { ...linha.quantidades, [categoria.id]: valor },
                          })
                        }
                        compacto
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {tipo === "individual" && (
            <p className="janelaGom__ajuda">
              Sem joiner, o item vai para Sem dono. Inter e taxa vazios ficam “a definir”.
            </p>
          )}

          {tipo === "set" && (
            <>
              <ConferenciaSet linhas={linhas} quantidades={quantidades} />
              <button
                type="button"
                className="botao botao__contorno janelaGom__adicionarJoiner"
                onClick={adicionarLinha}
              >
                + Adicionar joiner / membro
              </button>
            </>
          )}
        </div>

        {/* === Seção: Botões === */}
        {erroGeral && (
          <p className="janelaGom__erroGeral" role="alert">
            {erroGeral}
          </p>
        )}
        <div className={juntarClasses("janelaGom__botoes", editando && "janelaGom__botoesEditar")}>
          <button
            type="button"
            className="botao botao__contorno janelaGom__botao"
            onClick={pedirParaFechar}
            disabled={salvando || apagando}
          >
            Cancelar
          </button>
          {editando && (
            <button
              type="button"
              className="botao janelaGom__botao janelaGom__botaoExcluir"
              onClick={() => {
                setErroExcluir(null);
                setExcluindo(true);
              }}
              disabled={salvando || apagando}
            >
              Excluir item
            </button>
          )}
          <button
            type="submit"
            className="botao botao__rosa janelaGom__botao janelaGom__botaoSalvar"
            disabled={salvando || apagando}
          >
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Salvar item"}
          </button>
        </div>
      </form>

      {contaCriada && (
        <JanelaSenhaProvisoria {...contaCriada} aoFechar={() => setContaCriada(null)} />
      )}

      {descartando && (
        <JanelaConfirmar
          titulo={editando ? "Descartar as alterações?" : "Descartar este item?"}
          rotuloConfirmar="Descartar"
          tom="perigo"
          enviando={false}
          erro={null}
          aoCancelar={() => setDescartando(false)}
          aoConfirmar={fechar}
        >
          <p>
            {editando
              ? "O item continua como estava antes de abrir a janela."
              : "O que foi preenchido não será salvo."}
          </p>
        </JanelaConfirmar>
      )}

      {excluindo && registro && (
        <JanelaConfirmar
          titulo="Excluir este item?"
          rotuloConfirmar="Excluir item"
          tom="perigo"
          enviando={apagando}
          erro={erroExcluir}
          aoCancelar={() => setExcluindo(false)}
          aoConfirmar={excluir}
        >
          <p>
            <strong>{registro.nome}</strong> sai da planilha e de Meus itens.
          </p>
          {joinersDoItem.length > 0 && (
            <p>
              {joinersDoItem.length === 1 ? "O joiner" : "Os joiners"}{" "}
              <strong>
                {[...new Set(joinersDoItem.map((p) => `@${p.user}`))].join(", ")}
              </strong>{" "}
              {joinersDoItem.length === 1 ? "recebe" : "recebem"} um aviso.
            </p>
          )}
          {pagantes.length > 0 && (
            <p>
              Já tem pagamento marcado (
              {[...new Set(pagantes.map((p) => `@${p.user}`))].join(", ")}). Combine a devolução
              por fora.
            </p>
          )}
          <p>Não dá para desfazer.</p>
        </JanelaConfirmar>
      )}
    </dialog>
  );
}

// === Seção: Conferência das quantidades do set ===
// Mostra quanto já foi dividido entre os joiners em cada categoria do set
function ConferenciaSet({
  linhas,
  quantidades,
}: {
  linhas: Linha[];
  quantidades: Quantidades;
}) {
  const categorias = CATEGORIAS.filter(({ id }) => quantidades[id] > 0);
  if (categorias.length === 0) {
    return (
      <p className="janelaGom__conferencia">
        Preencha a quantidade do set para dividir entre os joiners.
      </p>
    );
  }
  const somar = (id: Categoria) =>
    linhas.reduce((total, linha) => total + linha.quantidades[id], 0);
  const certo = categorias.every(({ id }) => somar(id) === quantidades[id]);

  return (
    <p
      className={juntarClasses("janelaGom__conferencia", certo && "janelaGom__conferenciaCerta")}
      aria-live="polite"
    >
      Dividido:{" "}
      {categorias.map(({ id, resumo }, indice) => (
        <span key={id}>
          {indice > 0 && " · "}
          {somar(id)} de {quantidades[id]} {resumo.toLowerCase()}
        </span>
      ))}
    </p>
  );
}