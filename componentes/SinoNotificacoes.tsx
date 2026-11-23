"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ComponentType } from "react";
import { limparNotificacoes, marcarNotificacoesLidas } from "@/lib/acoesNotificacoes";
import { juntarClasses } from "@/lib/classes";
import type { CaixaDeEntrada, Notificacao, TipoNotificacao } from "@/lib/notificacoes";
import { IconeCaixa, IconeCamera, IconeCoracao, IconeEtiqueta, IconeFechar, IconeMegafone, IconeSino } from "./Icones";
import "@/estilos/componentes/SinoNotificacoes.css";

// === Seção: Aparência de cada tipo ===
const APARENCIA: Record<TipoNotificacao, { Icone: ComponentType<{ tamanho?: number }>; cor: string }> = {
  claim_pedido: { Icone: IconeCoracao, cor: "sino__iconeRosa" },
  claim_aceito: { Icone: IconeCoracao, cor: "sino__iconeRosa" },
  claim_recusado: { Icone: IconeFechar, cor: "sino__iconeBege" },
  proof: { Icone: IconeCamera, cor: "sino__iconeAzul" },
  taxa: { Icone: IconeEtiqueta, cor: "sino__iconeAmarelo" },
  frete: { Icone: IconeEtiqueta, cor: "sino__iconeAmarelo" },
  etapa_caixa: { Icone: IconeCaixa, cor: "sino__iconeMenta" },
  item: { Icone: IconeEtiqueta, cor: "sino__iconeBege" },
  aviso: { Icone: IconeMegafone, cor: "sino__iconeRosa" },
};

// === Seção: Sino com a lista de notificações ===
// Abrir a lista marca tudo como lido; as que eram novas continuam destacadas até fechar.
// A cada 20 segundos (e quando a aba volta a aparecer) busca avisos novos, sem recarregar a página.
const INTERVALO_BUSCA = 20_000;

export default function SinoNotificacoes({ itens: itensServidor, naoLidas: naoLidasServidor, gom }: CaixaDeEntrada & { gom: boolean }) {
  const referencia = useRef<HTMLDivElement>(null);
  const [buscada, setBuscada] = useState<CaixaDeEntrada | null>(null);
  // Quando a página traz uma lista nova do servidor, ela passa a valer
  const [doServidor, setDoServidor] = useState(itensServidor);
  if (doServidor !== itensServidor) {
    setDoServidor(itensServidor);
    setBuscada(null);
  }
  const { itens, naoLidas } = buscada ?? { itens: itensServidor, naoLidas: naoLidasServidor };
  const [aberto, setAberto] = useState(false);
  const [novas, setNovas] = useState<Set<number>>(new Set());
  const [, iniciar] = useTransition();

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (!referencia.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  useEffect(() => {
    let cancelado = false;
    async function buscar() {
      if (document.visibilityState !== "visible") return;
      try {
        const resposta = await fetch("/api/notificacoes", { cache: "no-store" });
        if (resposta.ok && !cancelado) setBuscada(await resposta.json());
      } catch {}
    }
    const temporizador = window.setInterval(buscar, INTERVALO_BUSCA);
    document.addEventListener("visibilitychange", buscar);
    return () => {
      cancelado = true;
      window.clearInterval(temporizador);
      document.removeEventListener("visibilitychange", buscar);
    };
  }, []);

  // "Limpar" pede um segundo clique ("Apagar todas?") antes de apagar
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false);

  useEffect(() => {
    if (!confirmandoLimpar) return;
    const tempo = window.setTimeout(() => setConfirmandoLimpar(false), 4000);
    return () => window.clearTimeout(tempo);
  }, [confirmandoLimpar]);

  function limpar() {
    if (!confirmandoLimpar) return setConfirmandoLimpar(true);
    setConfirmandoLimpar(false);
    setNovas(new Set());
    setBuscada({ itens: [], naoLidas: 0 });
    iniciar(() => limparNotificacoes());
  }

  function alternar() {
    if (aberto) return setAberto(false);
    setNovas(new Set(itens.filter((item) => !item.lida).map((item) => item.id)));
    setAberto(true);
    if (naoLidas > 0) {
      setBuscada({ itens: itens.map((item) => ({ ...item, lida: true })), naoLidas: 0 });
      iniciar(() => marcarNotificacoesLidas());
    }
  }

  const rotulo = naoLidas > 0 ? `Notificações, ${naoLidas} ${naoLidas === 1 ? "nova" : "novas"}` : "Notificações";

  return (
    <div className="sino" ref={referencia}>
      <button
        type="button"
        className="sino__botao"
        onClick={alternar}
        aria-expanded={aberto}
        aria-controls="lista-notificacoes"
        aria-label={rotulo}
      >
        <IconeSino tamanho={20} />
        {naoLidas > 0 && (
          <span className="sino__contador" aria-hidden="true">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="sino__painel" id="lista-notificacoes" role="region" aria-label="Notificações">
          <div className="sino__topo">
            <h2 className="sino__titulo">Notificações</h2>
            {novas.size > 0 && (
              <span className="sino__selo">
                {novas.size} {novas.size === 1 ? "nova" : "novas"}
              </span>
            )}
            {itens.length > 0 && (
              <button
                type="button"
                className={juntarClasses("sino__limpar", confirmandoLimpar && "sino__limparConfirmar")}
                onClick={limpar}
                aria-live="polite"
              >
                {confirmandoLimpar ? "Apagar todas?" : "Limpar"}
              </button>
            )}
          </div>

          {itens.length === 0 ? (
            <div className="sino__vazio">
              <span className="sino__vazioIcone" aria-hidden="true">
                <IconeSino tamanho={22} />
              </span>
              <p className="sino__vazioTitulo">Tudo quietinho por aqui</p>
              <p className="sino__vazioTexto">
                {gom
                  ? "Quando um joiner pedir um item sem dono, o aviso aparece aqui."
                  : "Quando uma caixa andar, uma taxa chegar ou um claim for respondido, o aviso aparece aqui."}
              </p>
            </div>
          ) : (
            <ul className="sino__lista">
              {itens.map((item) => (
                <ItemNotificacao key={item.id} item={item} nova={novas.has(item.id)} aoAbrir={() => setAberto(false)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// === Seção: Uma notificação ===
function ItemNotificacao({ item, nova, aoAbrir }: { item: Notificacao; nova: boolean; aoAbrir: () => void }) {
  const { Icone, cor } = APARENCIA[item.tipo];
  const conteudo = (
    <>
      <span className={juntarClasses("sino__icone", cor)} aria-hidden="true">
        <Icone tamanho={14} />
      </span>
      <span className="sino__texto">
        <span className="sino__mensagem">{item.texto}</span>
        <span className="sino__quando">{item.quando}</span>
      </span>
      {nova && <span className="sino__pontoNova" aria-label="Nova" />}
    </>
  );

  return (
    <li>
      {item.link ? (
        <Link href={item.link} className={juntarClasses("sino__item", nova && "sino__itemNova")} onClick={aoAbrir}>
          {conteudo}
        </Link>
      ) : (
        <div className={juntarClasses("sino__item", nova && "sino__itemNova")}>{conteudo}</div>
      )}
    </li>
  );
}
