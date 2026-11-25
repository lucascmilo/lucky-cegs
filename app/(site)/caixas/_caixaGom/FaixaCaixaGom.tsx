"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import { IconeLapis, IconeMegafone } from "@/componentes/Icones";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import { juntarClasses } from "@/lib/classes";
import { chamar } from "@/lib/conexao";
import { ETAPAS_CAIXA, type EtapaCaixa, obterEtapaCaixa } from "@/lib/etapas";
import type { AvisoEnviado, CaixaGom, JoinerOpcao } from "@/lib/planilhaCaixa";
import trevoFoto from "@/public/imagens/adesivo-trevo-foto.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import coracaoBranco from "@/public/imagens/coracao-branco.svg";
import fotoCaixasGom from "@/public/imagens/modelo-caixas-gom.png";
import NomeCaixa from "../_caixa/NomeCaixa";
import { mudarSituacaoCaixa } from "../acoes";
import JanelaAviso from "./JanelaAviso";
import JanelaCaixa from "./JanelaCaixa";
import JanelaItem from "./JanelaItem";

type PropsFaixaCaixaGom = {
  caixa: CaixaGom;
  caixas: CaixaGom[];
  joiners: JoinerOpcao[];
  // Users dos joiners com itens nesta caixa (para os avisos)
  joinersDaCaixa: string[];
  avisos: AvisoEnviado[];
  totalRegistros: number;
  // ?novo=1 abre "Novo item" e ?nova=1 abre "Nova caixa" ao carregar
  abrirNovoItem: boolean;
  abrirNovaCaixa: boolean;
};

type Janela = "novoItem" | "novaCaixa" | "editarCaixa" | "aviso" | null;

const ORDEM_ORIGEM: Record<string, number> = {
  JP: 0,
  KR: 1,
  CH: 2,
  PH: 3,
};

function analisarCaixaOrdenacao(item: CaixaGom) {
  const correspondencia = item.nome.match(/(\d+)/);
  const numero = correspondencia ? Number(correspondencia[1]) : Number.MAX_SAFE_INTEGER;

  const origemBruta =
    (item as CaixaGom & { origem?: string }).origem ??
    item.nome.match(/\b(JP|KR|CH|PH)\b/i)?.[1] ??
    "";
  const origem = origemBruta.trim().toUpperCase();
  const pesoOrigem = ORDEM_ORIGEM[origem] ?? 99;

  return { numero, pesoOrigem, origem };
}

function compararCaixasGom(a: CaixaGom, b: CaixaGom) {
  const infoA = analisarCaixaOrdenacao(a);
  const infoB = analisarCaixaOrdenacao(b);

  if (infoA.numero !== infoB.numero) {
    return infoA.numero - infoB.numero;
  }
  if (infoA.pesoOrigem !== infoB.pesoOrigem) {
    return infoA.pesoOrigem - infoB.pesoOrigem;
  }
  return infoA.origem.localeCompare(infoB.origem, "pt-BR");
}

// Tira só o parâmetro que abriu a janela (busca e filtro da planilha continuam no endereço)
function limparEndereco(parametro: string) {
  const endereco = new URL(window.location.href);
  if (!endereco.searchParams.has(parametro)) return;
  endereco.searchParams.delete(parametro);
  window.history.replaceState(window.history.state, "", endereco);
}

// === Seção: Faixa amarela do topo (GOM) ===
export default function FaixaCaixaGom({
  caixa,
  caixas,
  joiners,
  joinersDaCaixa,
  avisos,
  totalRegistros,
  abrirNovoItem,
  abrirNovaCaixa,
}: PropsFaixaCaixaGom) {
  const [janela, setJanela] = useState<Janela>(
    abrirNovaCaixa ? "novaCaixa" : abrirNovoItem ? "novoItem" : null,
  );
  // Cada abertura monta uma janela nova (se uma anterior não desmontou ao fechar, ela não trava o botão)
  const [vez, setVez] = useState(0);

  function abrir(qual: Exclude<Janela, null>) {
    setJanela(qual);
    setVez((anterior) => anterior + 1);
  }
  const [novaSituacao, setNovaSituacao] = useState<EtapaCaixa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const linhaCaixas = useRef<HTMLDivElement>(null);
  const [bordas, setBordas] = useState({ inicio: false, fim: false });

  // Mostra o degradê só do lado em que ainda tem pílula escondida
  function medirBordas() {
    const linha = linhaCaixas.current;
    if (!linha) return;
    const fim = linha.scrollWidth - linha.clientWidth - linha.scrollLeft;
    setBordas({ inicio: linha.scrollLeft > 2, fim: fim > 2 });
  }

  // Com muitas caixas, a linha rola até a pílula da caixa aberta
  useEffect(() => {
    const linha = linhaCaixas.current;
    const ativa = linha?.querySelector<HTMLElement>('[aria-current="page"]');
    if (linha && ativa) {
      const caixaLinha = linha.getBoundingClientRect();
      const caixaAtiva = ativa.getBoundingClientRect();
      linha.scrollLeft +=
        caixaAtiva.left - caixaLinha.left - (caixaLinha.width - caixaAtiva.width) / 2;
    }
    medirBordas();
    const observador = new ResizeObserver(medirBordas);
    if (linha) observador.observe(linha);
    return () => observador.disconnect();
  }, []);

  // O ?novo=1 / ?nova=1 só serve para abrir a janela: sai do endereço na hora (se ficasse até fechar,
  // a página atualizada depois de salvar traria o parâmetro de volta)
  useEffect(() => {
    limparEndereco("novo");
    limparEndereco("nova");
  }, []);

  function fecharJanela() {
    setJanela(null);
  }

  function confirmarSituacao(situacao: EtapaCaixa) {
    iniciar(async () => {
      const resultado = await chamar(() => mudarSituacaoCaixa(caixa.id, situacao));
      if (!resultado.ok) return setErro(resultado.erro);
      setNovaSituacao(null);
      mostrarAviso(`Situação mudada para ${obterEtapaCaixa(situacao).rotulo}.`);
    });
  }

  const caixasOrdenadas = [...caixas].sort(compararCaixasGom);

  return (
    <section className="caixaTopo caixaGomTopo">
      <div className="caixaTopo__conteudo caixaGomTopo__conteudo">
        <h1 className="caixaTopo__titulo">
          <NomeCaixa nome={caixa.nome} />
        </h1>

        {/* === Seção: Todas as caixas, ordenadas por número e origem (JP > KR > CH > PH) === */}
        <nav className="caixaGomTopo__navCaixas" aria-label="Caixas">
          <button
            type="button"
            className="pilulaSelecao caixaGomTopo__pilula caixaGomTopo__novaCaixa"
            onClick={() => abrir("novaCaixa")}
          >
            + Nova Caixa
          </button>
          <div
            ref={linhaCaixas}
            className={juntarClasses(
              "caixaGomTopo__caixas",
              bordas.inicio && "caixaGomTopo__caixasAntes",
              bordas.fim && "caixaGomTopo__caixasDepois",
            )}
            onScroll={medirBordas}
          >
            {caixasOrdenadas.map((item) => (
              <Link
                key={item.id}
                href={`/caixas/${item.id}`}
                className={juntarClasses(
                  "pilulaSelecao caixaGomTopo__pilula",
                  item.id === caixa.id && "pilulaSelecao__ativa",
                )}
                aria-current={item.id === caixa.id ? "page" : undefined}
              >
                {item.nome}
              </Link>
            ))}
          </div>
        </nav>

        {/* === Seção: Adicionar item, situação e editar a caixa === */}
        <div className="caixaGomTopo__acoes">
          <button
            type="button"
            className="botao botao__rosa caixaGomTopo__adicionar"
            onClick={() => abrir("novoItem")}
          >
            + Adicionar item
          </button>

          <div className="caixaGomTopo__situacao">
            <label htmlFor="situacao-caixa" className="caixaGomTopo__rotulo">
              Situação:
            </label>
            <select
              id="situacao-caixa"
              className="seletorGom caixaGomTopo__seletor"
              value={caixa.situacao}
              onChange={(evento) => {
                setErro(null);
                setNovaSituacao(evento.target.value as EtapaCaixa);
              }}
            >
              {ETAPAS_CAIXA.map((etapa) => (
                <option key={etapa.id} value={etapa.id}>
                  {etapa.rotulo}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="caixaGomTopo__editarCaixa"
              onClick={() => abrir("aviso")}
              aria-label={`Postar aviso para os joiners da ${caixa.nome}`}
              title="Postar aviso"
            >
              <IconeMegafone aria-hidden="true" />
            </button>
            <button
              type="button"
              className="caixaGomTopo__editarCaixa"
              onClick={() => abrir("editarCaixa")}
              aria-label={`Editar ${caixa.nome}`}
              title="Editar caixa"
            >
              <IconeLapis tamanho={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* === Seção: Colagem === */}
        <div className="caixaTopo__colagem" aria-hidden="true">
          <span className="caixaTopo__quadrado caixaGomTopo__quadrado" />
          <Image src={fotoCaixasGom} alt="" sizes="190px" className="caixaTopo__foto" priority />
          <Image src={codigoBarras} alt="" sizes="160px" className="caixaTopo__codigoBarras" />
          <Image
            src={coracaoBranco}
            alt=""
            width={40}
            height={40}
            className="caixaTopo__coracao"
          />
          <Image src={trevoFoto} alt="" sizes="90px" className="caixaTopo__adesivoTrevo" />
        </div>
      </div>

      {novaSituacao && (
        <JanelaConfirmar
          titulo="Mudar a situação da caixa?"
          rotuloConfirmar="Mudar situação"
          enviando={salvando}
          erro={erro}
          aoCancelar={() => setNovaSituacao(null)}
          aoConfirmar={() => confirmarSituacao(novaSituacao)}
        >
          <p>
            <strong>{caixa.nome}</strong> passa para{" "}
            <strong>{obterEtapaCaixa(novaSituacao).rotulo}</strong>.
          </p>
          <p>
            {novaSituacao === "warehouse"
              ? "Os itens que já tinham saído voltam para Na warehouse."
              : `Todos os itens da caixa vão para ${obterEtapaCaixa(novaSituacao).rotulo}.`}
          </p>
          {joinersDaCaixa.length > 0 && (
            <p>
              {joinersDaCaixa.length === 1
                ? "O joiner da caixa recebe um aviso."
                : `Os ${joinersDaCaixa.length} joiners da caixa recebem um aviso.`}
            </p>
          )}
        </JanelaConfirmar>
      )}

      {janela === "novoItem" && (
        <JanelaItem
          key={vez}
          caixa={caixa}
          caixas={caixas}
          joiners={joiners}
          aoFechar={fecharJanela}
          aoSalvar={mostrarAviso}
        />
      )}

      {janela === "aviso" && (
        <JanelaAviso
          key={vez}
          caixaId={caixa.id}
          nomeCaixa={caixa.nome}
          joiners={joinersDaCaixa}
          enviados={avisos}
          aoFechar={fecharJanela}
        />
      )}

      {janela === "novaCaixa" && (
        <JanelaCaixa key={vez} caixas={caixas} aoFechar={fecharJanela} />
      )}

      {janela === "editarCaixa" && (
        <JanelaCaixa
          key={vez}
          caixas={caixas}
          caixa={caixa}
          totalRegistros={totalRegistros}
          aoFechar={fecharJanela}
        />
      )}
    </section>
  );
}