"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import { IconeFechar } from "@/componentes/Icones";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import { juntarClasses } from "@/lib/classes";
import { chamar } from "@/lib/conexao";
import { ORIGENS } from "@/lib/configuracoes";
import { ETAPAS_CAIXA, type EtapaCaixa, obterEtapaCaixa } from "@/lib/etapas";
import type { CaixaGom } from "@/lib/planilhaCaixa";
import { useAvisoAoSair } from "@/lib/useAvisoAoSair";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import { criarCaixa, editarCaixa, excluirCaixa } from "../acoesCaixa";
import "@/estilos/componentes/JanelaGom.css";

const SIGLAS = Object.keys(ORIGENS);
const PADRAO_NOME = /^caixa\s+(\d+)\s+([a-z]{2})$/i;

// "Caixa 7 JP" → { numero: 7, sigla: "JP" }
function lerNome(nome: string) {
  const partes = PADRAO_NOME.exec(nome.trim());
  return partes ? { numero: Number(partes[1]), sigla: partes[2].toUpperCase() } : null;
}

// O número seguinte ao maior já usado com essa origem
function proximoNumero(caixas: CaixaGom[], sigla: string) {
  const usados = caixas.map((c) => lerNome(c.nome)).filter((lido) => lido?.sigla === sigla);
  return Math.max(0, ...usados.map((lido) => lido!.numero)) + 1;
}

function hojeEmSaoPaulo() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

type PropsJanelaCaixa = {
  caixas: CaixaGom[];
  // Com caixa, a janela edita; sem, cria uma caixa nova
  caixa?: CaixaGom;
  totalRegistros?: number;
  aoFechar: () => void;
};

// === Seção: Janela "Nova caixa" / "Editar caixa" ===
// O nome é sempre "Caixa <número> <origem>". Na caixa nova, o número sugerido é o próximo daquela origem.
export default function JanelaCaixa({
  caixas,
  caixa,
  totalRegistros = 0,
  aoFechar,
}: PropsJanelaCaixa) {
  const router = useRouter();
  const editando = Boolean(caixa);
  const referencia = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);

  const [inicial] = useState(() => {
    const lido = caixa ? lerNome(caixa.nome) : null;
    const origem =
      caixa?.origem && SIGLAS.includes(caixa.origem) ? caixa.origem : (lido?.sigla ?? "JP");
    return {
      numero: String(lido?.numero ?? (caixa ? "" : proximoNumero(caixas, origem))),
      origem,
      situacao: caixa?.situacao ?? ("warehouse" as EtapaCaixa),
      abertura: caixa?.abertura ?? hojeEmSaoPaulo(),
      observacao: caixa?.observacao ?? "",
    };
  });
  const [numero, setNumero] = useState(inicial.numero);
  const [numeroMexido, setNumeroMexido] = useState(editando);
  const [origem, setOrigem] = useState(inicial.origem);
  const [situacao, setSituacao] = useState<EtapaCaixa>(inicial.situacao);
  const [abertura, setAbertura] = useState(inicial.abertura);
  const [observacao, setObservacao] = useState(inicial.observacao);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const [descartando, setDescartando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  useEffect(() => {
    if (Object.keys(erros).length === 0) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [erros]);

  const alterado =
    JSON.stringify({ numero, origem, situacao, abertura, observacao }) !== JSON.stringify(inicial);
  useAvisoAoSair(alterado);

  const nome = `Caixa ${numero.trim() || "?"} ${origem}`;
  const repetida = caixas.some(
    (c) => c.id !== caixa?.id && c.nome.toLowerCase() === nome.toLowerCase(),
  );

  function apagarErro(chave: string) {
    setErros((anteriores) =>
      Object.fromEntries(Object.entries(anteriores).filter(([c]) => c !== chave)),
    );
  }

  function escolherOrigem(sigla: string) {
    setOrigem(sigla);
    // Enquanto a GOM não mexer no número, ele acompanha a origem escolhida
    if (!numeroMexido) setNumero(String(proximoNumero(caixas, sigla)));
  }

  // Fecha e avisa a tela na hora: o evento "close" do navegador pode se perder enquanto a página atualiza
  const jaFechou = useRef(false);
  function fechar() {
    referencia.current?.close();
    aoFecharJanela();
  }

  function aoFecharJanela() {
    if (jaFechou.current) return;
    jaFechou.current = true;
    aoFechar();
  }

  function pedirParaFechar() {
    if (salvando) return;
    if (alterado) setDescartando(true);
    else fechar();
  }

  function salvar() {
    setErroGeral(null);
    const encontrados: Record<string, string> = {};
    if (!/^\d{1,4}$/.test(numero.trim()) || Number(numero) < 1) {
      encontrados.numero = "Use o número da caixa, como 7.";
    } else if (repetida) {
      encontrados.numero = `Já existe a ${nome}.`;
    }
    if (!abertura) encontrados.abertura = "Escolha a data de abertura.";
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    const dados = { numero: numero.trim(), origem, situacao, abertura, observacao };
    iniciar(async () => {
      const resultado = caixa
        ? await chamar(() => editarCaixa(caixa.id, dados))
        : await chamar(() => criarCaixa(dados));
      if (!resultado.ok) {
        setErros(resultado.erros);
        setErroGeral(resultado.erro ?? "Confira os campos marcados.");
        return;
      }
      mostrarAviso(caixa ? `${nome} foi atualizada.` : `${nome} foi criada.`);
      fechar();
      if (!caixa) router.push(`/caixas/${resultado.id}`);
    });
  }

  function excluir() {
    if (!caixa) return;
    setErroExcluir(null);
    iniciar(async () => {
      const resultado = await chamar(() => excluirCaixa(caixa.id));
      if (!resultado.ok) return setErroExcluir(resultado.erro);
      mostrarAviso(`${caixa.nome} foi excluída.`);
      fechar();
      router.push("/caixas");
    });
  }

  function propsErro(chave: string, id: string) {
    return {
      id,
      "aria-invalid": Boolean(erros[chave]),
      "aria-describedby": erros[chave] ? `${id}-erro` : undefined,
    };
  }

  const etapa = obterEtapaCaixa(situacao);

  return (
    <dialog
      ref={referencia}
      className="janelaGom"
      aria-labelledby="titulo-janela-caixa"
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
        onSubmit={(evento) => {
          evento.preventDefault();
          salvar();
        }}
      >
        <div className="janelaGom__topo">
          <h2 id="titulo-janela-caixa" className="janelaGom__titulo">
            {editando ? "EDITAR CAIXA" : "NOVA CAIXA"}
          </h2>
          <button
            type="button"
            className="janelaGom__fechar"
            onClick={pedirParaFechar}
            disabled={salvando}
            aria-label="Fechar sem salvar"
          >
            <IconeFechar tamanho={22} aria-hidden="true" />
          </button>
        </div>

        {/* === Seção: Nome (CAIXA + número + origem) === */}
        <div className="janelaGom__linha janelaGom__campo">
          <label htmlFor="caixa-numero" className="janelaGom__rotulo">
            Nome da caixa
          </label>
          <span
            className={juntarClasses("janelaCaixa__nome", erros.numero && "janelaCaixa__nomeErro")}
          >
            <span className="janelaCaixa__prefixo" aria-hidden="true">
              CAIXA
            </span>
            <input
              {...propsErro("numero", "caixa-numero")}
              className="janelaCaixa__numero"
              value={numero}
              onChange={(evento) => {
                setNumero(evento.target.value.replace(/\D/g, "").slice(0, 4));
                setNumeroMexido(true);
                apagarErro("numero");
              }}
              inputMode="numeric"
              autoComplete="off"
              aria-label="Número da caixa"
            />
            <span className="janelaCaixa__sufixo" aria-hidden="true">
              {origem}
            </span>
          </span>
          {erros.numero ? (
            <p id="caixa-numero-erro" className="janelaGom__erro">
              {erros.numero}
            </p>
          ) : repetida ? (
            <p className="janelaGom__erro">Já existe a {nome}.</p>
          ) : (
            !editando && (
              <p className="janelaGom__ajuda">Sugestão: o próximo número de {ORIGENS[origem]}.</p>
            )
          )}
        </div>

        {/* === Seção: Origem === */}
        <fieldset className="janelaGom__linha janelaGom__grupoCampos">
          <legend className="janelaGom__rotulo">Origem</legend>
          <div className="janelaCaixa__origens">
            {SIGLAS.map((sigla) => (
              <label
                key={sigla}
                className={juntarClasses(
                  "janelaCaixa__origem",
                  origem === sigla && "janelaCaixa__origemAtiva",
                )}
              >
                <input
                  type="radio"
                  name="origem"
                  value={sigla}
                  checked={origem === sigla}
                  onChange={() => escolherOrigem(sigla)}
                  className="somenteLeitorTela"
                />
                {ORIGENS[sigla]}
              </label>
            ))}
          </div>
        </fieldset>

        {/* === Seção: Situação inicial e abertura === */}
        <div className="janelaGom__linha janelaCaixa__duas">
          <div className="janelaGom__campo">
            <label htmlFor="caixa-situacao" className="janelaGom__rotulo">
              {editando ? "Situação" : "Situação inicial"}
            </label>
            <select
              id="caixa-situacao"
              className="seletorGom janelaGom__entrada janelaGom__entradaAlta"
              value={situacao}
              onChange={(evento) => setSituacao(evento.target.value as EtapaCaixa)}
              disabled={editando}
              title={
                editando
                  ? "A situação muda pela faixa da caixa, onde os joiners recebem aviso"
                  : undefined
              }
            >
              {ETAPAS_CAIXA.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="janelaGom__campo">
            <label htmlFor="caixa-abertura" className="janelaGom__rotulo">
              Abertura da caixa
            </label>
            <input
              {...propsErro("abertura", "caixa-abertura")}
              type="date"
              className="janelaGom__entrada janelaGom__entradaAlta janelaCaixa__data"
              value={abertura}
              onChange={(evento) => {
                setAbertura(evento.target.value);
                apagarErro("abertura");
              }}
              required
            />
            {erros.abertura && (
              <p id="caixa-abertura-erro" className="janelaGom__erro">
                {erros.abertura}
              </p>
            )}
          </div>
        </div>

        {/* === Seção: Observação (só a GOM vê) === */}
        <div className="janelaGom__linha janelaGom__campo">
          <label htmlFor="caixa-observacao" className="janelaGom__rotulo">
            Descrição ou observação
          </label>
          <textarea
            id="caixa-observacao"
            className="janelaGom__entrada janelaCaixa__observacao"
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
            placeholder="Ex.: prazo de pagamento de item, regras…"
            maxLength={1000}
          />
          <p className="janelaGom__ajuda">Só a GOM vê.</p>
        </div>

        {/* === Seção: Prévia === */}
        <div className="janelaCaixa__previa" aria-live="polite">
          <div className="janelaCaixa__textoPrevia">
            <span className="janelaCaixa__etiqueta">PRÉVIA</span>
            <strong className="janelaCaixa__nomePrevia">{nome.toUpperCase()}</strong>
            <span className="janelaCaixa__detalhes">
              {ORIGENS[origem]} · {totalRegistros}{" "}
              {totalRegistros === 1 ? "registro" : "registros"} · {etapa.rotulo}
            </span>
          </div>
          <Image src={codigoBarras} alt="" sizes="232px" className="janelaCaixa__codigo" />
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
            disabled={salvando}
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
              disabled={salvando || totalRegistros > 0}
              title={totalRegistros > 0 ? "Só dá para excluir uma caixa vazia" : undefined}
            >
              Excluir caixa
            </button>
          )}
          <button
            type="submit"
            className="botao botao__rosa janelaGom__botao janelaCaixa__botaoCriar"
            disabled={salvando}
          >
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Criar caixa"}
          </button>
        </div>
        {editando && totalRegistros > 0 && (
          <p className="janelaGom__ajuda janelaCaixa__avisoExcluir">
            Para excluir, a caixa precisa estar vazia: mova ou exclua os itens antes.
          </p>
        )}
      </form>

      {descartando && (
        <JanelaConfirmar
          titulo={editando ? "Descartar as alterações?" : "Descartar esta caixa?"}
          rotuloConfirmar="Descartar"
          tom="perigo"
          enviando={false}
          erro={null}
          aoCancelar={() => setDescartando(false)}
          aoConfirmar={fechar}
        >
          <p>O que foi preenchido não será salvo.</p>
        </JanelaConfirmar>
      )}

      {excluindo && caixa && (
        <JanelaConfirmar
          titulo="Excluir esta caixa?"
          rotuloConfirmar="Excluir caixa"
          tom="perigo"
          enviando={salvando}
          erro={erroExcluir}
          aoCancelar={() => setExcluindo(false)}
          aoConfirmar={excluir}
        >
          <p>
            <strong>{caixa.nome}</strong> sai do site. Não dá para desfazer.
          </p>
        </JanelaConfirmar>
      )}
    </dialog>
  );
}