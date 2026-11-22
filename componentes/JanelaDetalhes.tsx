"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import BotaoCopiar from "@/componentes/BotaoCopiar";
import FotoItem from "@/componentes/FotoItem";
import { IconeCheck, IconeCoracao, IconeFechar } from "@/componentes/Icones";
import { EtiquetaMeu, PilulaEtapa, SeloPagamento } from "@/componentes/PecasItem";
import TextoCortado from "@/componentes/TextoCortado";
import { juntarClasses } from "@/lib/classes";
import { EMAIL_PIX } from "@/lib/configuracoes";
import { ABAS_DETALHES, type AbaDetalhes, type DetalheItem } from "@/lib/detalheItem";
import "@/estilos/componentes/JanelaDetalhes.css";

// === Seção: Controle da janela ===
// Os detalhes dos itens do joiner já vêm com a página: a janela abre na hora, sem ir ao servidor.
// Um link com ?item=…&aba=… abre a janela direto ao carregar a página.
const ContextoDetalhes = createContext<(itemId: number) => void>(() => {});

type PropsProvedorDetalhes = {
  detalhes: Record<number, DetalheItem>;
  itemInicial: number | null;
  abaInicial: AbaDetalhes;
  children: ReactNode;
};

export function ProvedorDetalhes({ detalhes, itemInicial, abaInicial, children }: PropsProvedorDetalhes) {
  const [aberto, setAberto] = useState<{ id: number; aba: AbaDetalhes } | null>(
    itemInicial && detalhes[itemInicial] ? { id: itemInicial, aba: abaInicial } : null,
  );

  const abrir = useCallback((id: number) => setAberto({ id, aba: "fotos" }), []);

  function fechar() {
    setAberto(null);
    // Tira o ?item do endereço quando a janela foi aberta por um link
    const endereco = new URL(window.location.href);
    if (endereco.searchParams.has("item")) {
      endereco.searchParams.delete("item");
      endereco.searchParams.delete("aba");
      window.history.replaceState(window.history.state, "", endereco);
    }
  }

  const detalhe = aberto ? detalhes[aberto.id] : null;

  return (
    <ContextoDetalhes.Provider value={abrir}>
      {children}
      {detalhe && aberto && <JanelaDetalhes key={detalhe.id} detalhe={detalhe} abaInicial={aberto.aba} aoFechar={fechar} />}
    </ContextoDetalhes.Provider>
  );
}

// === Seção: Botão "Detalhes" ===
export function BotaoDetalhes({ itemId, className }: { itemId: number; className: string }) {
  const abrir = useContext(ContextoDetalhes);
  return (
    <button type="button" className={className} onClick={() => abrir(itemId)} aria-haspopup="dialog">
      Detalhes
    </button>
  );
}

// === Seção: Janela de detalhes de um item do joiner ===
// Fecha no X, no Esc ou clicando fora, sempre com uma animação curta.
type PropsJanelaDetalhes = {
  detalhe: DetalheItem;
  abaInicial: AbaDetalhes;
  aoFechar: () => void;
};

const DURACAO_FECHAR = 180;

function JanelaDetalhes({ detalhe, abaInicial, aoFechar }: PropsJanelaDetalhes) {
  const referenciaJanela = useRef<HTMLDialogElement>(null);
  const [aba, setAba] = useState(abaInicial);
  const [fechando, setFechando] = useState(false);

  useEffect(() => {
    referenciaJanela.current?.showModal();
  }, []);

  function fecharSuave() {
    if (fechando) return;
    setFechando(true);
    window.setTimeout(() => {
      referenciaJanela.current?.close();
      aoFechar();
    }, DURACAO_FECHAR);
  }

  function trocarAba(nova: AbaDetalhes) {
    setAba(nova);
    document.getElementById(`aba-${nova}`)?.focus();
  }

  return (
    <dialog
      ref={referenciaJanela}
      className={juntarClasses("janelaDetalhes", fechando && "janelaDetalhes__fechando")}
      aria-labelledby="titulo-detalhes"
      onCancel={(evento) => {
        evento.preventDefault();
        fecharSuave();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fecharSuave();
      }}
    >
      <div className="janelaDetalhes__conteudo">
        {/* === Seção: Cabeçalho === */}
        <div className="janelaDetalhes__topo">
          <EtiquetaMeu className="janelaDetalhes__etiqueta" />
          <p className="janelaDetalhes__cabecalho">{detalhe.cabecalho}</p>
          <button type="button" className="janelaDetalhes__fechar" onClick={fecharSuave} aria-label="Fechar detalhes">
            <IconeFechar />
          </button>
        </div>

        <h2 id="titulo-detalhes" className="janelaDetalhes__titulo">
          <TextoCortado texto={detalhe.nome} />
        </h2>
        <div className="janelaDetalhes__pilulas">
          <PilulaEtapa situacao={detalhe.situacao} />
          {detalhe.quantidades.map((texto) => (
            <span key={texto} className="pilulaContorno">
              {texto}
            </span>
          ))}
        </div>

        {/* === Seção: Abas === */}
        <div className="janelaDetalhes__abas" role="tablist" aria-label="Detalhes do item">
          {ABAS_DETALHES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`aba-${item.id}`}
              aria-selected={aba === item.id}
              aria-controls={`painel-${item.id}`}
              tabIndex={aba === item.id ? 0 : -1}
              className={juntarClasses("janelaDetalhes__aba", aba === item.id && "janelaDetalhes__abaAtiva")}
              onClick={() => trocarAba(item.id)}
              onKeyDown={(evento) => {
                // Setas trocam de aba, como esperado em abas acessíveis
                const passo = evento.key === "ArrowRight" ? 1 : evento.key === "ArrowLeft" ? -1 : 0;
                if (!passo) return;
                const indice = ABAS_DETALHES.findIndex((a) => a.id === aba);
                trocarAba(ABAS_DETALHES[(indice + passo + ABAS_DETALHES.length) % ABAS_DETALHES.length].id);
              }}
            >
              {item.rotulo}
            </button>
          ))}
        </div>

        <div className="janelaDetalhes__painel" role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
          {aba === "fotos" && <PainelFotos detalhe={detalhe} />}
          {aba === "status" && <PainelStatus detalhe={detalhe} />}
          {aba === "pagamento" && <PainelPagamento detalhe={detalhe} />}
        </div>
      </div>
    </dialog>
  );
}

// === Seção: Aba Fotos ===
function PainelFotos({ detalhe }: { detalhe: DetalheItem }) {
  return (
    <div className="janelaDetalhes__fotos">
      <FotoItem publicId={detalhe.fotoId} descricao={`Foto de ${detalhe.nome}`} className="janelaDetalhes__foto" />
      <FotoItem publicId={detalhe.proofWhId} descricao={`Balança de ${detalhe.nome}`} className="janelaDetalhes__foto" />
    </div>
  );
}

// === Seção: Aba Status (linha do tempo das etapas) ===
function PainelStatus({ detalhe }: { detalhe: DetalheItem }) {
  return (
    <ol className="linhaTempo">
      {detalhe.etapas.map((etapa) => (
        <li key={etapa.id} className={juntarClasses("linhaTempo__etapa", `linhaTempo__${etapa.estado}`)}>
          <span className="linhaTempo__marcador" aria-hidden="true">
            {etapa.estado === "feita" && <IconeCheck tamanho={18} />}
            {etapa.estado === "atual" && <IconeCoracao tamanho={14} />}
          </span>

          {etapa.estado === "atual" ? (
            <div className="linhaTempo__quadro" aria-current="step">
              <span className="linhaTempo__etiqueta">ETAPA ATUAL</span>
              {etapa.data && <span className="linhaTempo__dataAtual">{etapa.data}</span>}
              <p className="linhaTempo__tituloAtual">{etapa.rotulo}</p>
              <p className="linhaTempo__descricao">{etapa.descricao}</p>
            </div>
          ) : (
            <>
              <span className="linhaTempo__rotulo">{etapa.rotulo}</span>
              {etapa.data && <span className="linhaTempo__data">{etapa.data}</span>}
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

// === Seção: Aba Pagamento (valores somados das partes do joiner) ===
function PainelPagamento({ detalhe }: { detalhe: DetalheItem }) {
  return (
    <div className="pagamentoItem">
      <ul className="pagamentoItem__linhas">
        {detalhe.pagamento.map((linha) => (
          <li key={linha.rotulo} className="pagamentoItem__linha">
            <span className="pagamentoItem__rotulo">{linha.rotulo}</span>
            <span className="pagamentoItem__valor">{linha.valor}</span>
            <SeloPagamento estado={linha.estado} />
          </li>
        ))}
      </ul>

      {detalhe.faltaPagar ? (
        <div className="pagamentoItem__falta">
          <p className="pagamentoItem__faltaTexto">
            Falta pagar <strong>{detalhe.faltaPagar}</strong>
          </p>
          <div className="pagamentoItem__pix">
            <span className="pagamentoItem__email">{EMAIL_PIX}</span>
            <BotaoCopiar texto={EMAIL_PIX} variante="claro" />
            <span className="pagamentoItem__aviso">Enviar comprovantes apenas pelo grupo</span>
          </div>
        </div>
      ) : (
        <div className="pagamentoItem__falta pagamentoItem__tudoPago">
          <IconeCheck tamanho={20} />
          Tudo pago
        </div>
      )}
    </div>
  );
}
