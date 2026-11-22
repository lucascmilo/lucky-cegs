"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import FotoItem from "@/componentes/FotoItem";
import { IconeBaixar, IconeCoracao, IconeRelogio, IconeSeta } from "@/componentes/Icones";
import { BotaoDetalhes } from "@/componentes/JanelaDetalhes";
import { juntarClasses } from "@/lib/classes";
import { enderecoDownload } from "@/lib/cloudinary";
import carimboPostal from "@/public/imagens/carimbo-postal.png";

// === Seção: Tipos ===
export type CaixaPostal = {
  id: number;
  nome: string;
  fotoId: string | null;
  // Data em que a caixa chegou na casa da GOM
  chegouEm: string;
  // Data em que a GOM subiu a foto (null = foto ainda não chegou)
  enviadaEm: string | null;
  itens: { id: number; nome: string }[];
};

type PropsFichario = {
  caixas: CaixaPostal[];
  eu: { nome: string; user: string };
  caixaInicial: number | null;
};

const ITENS_VISIVEIS = 4;

// === Seção: Fichário ===
// Lista das caixas à esquerda; o cartão-postal da caixa escolhida à direita.
// A caixa escolhida fica no endereço (?caixa=…) para o link levar direto a ela.
export default function Fichario({ caixas, eu, caixaInicial }: PropsFichario) {
  const [idAtual, setIdAtual] = useState(caixas.some((c) => c.id === caixaInicial) ? caixaInicial! : caixas[0].id);
  const atual = caixas.find((c) => c.id === idAtual) ?? caixas[0];

  function escolher(id: number) {
    setIdAtual(id);
    const endereco = new URL(window.location.href);
    endereco.searchParams.set("caixa", String(id));
    window.history.replaceState(window.history.state, "", endereco);
  }

  // Setas trocam de caixa, como esperado em abas acessíveis
  function aoApertarTecla(evento: KeyboardEvent<HTMLDivElement>) {
    const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[evento.key];
    if (!passo) return;
    evento.preventDefault();
    const indice = (caixas.findIndex((c) => c.id === idAtual) + passo + caixas.length) % caixas.length;
    escolher(caixas[indice].id);
    document.getElementById(`aba-caixa-${caixas[indice].id}`)?.focus();
  }

  return (
    <div className="fichario">
      {/* === Seção: Lista das caixas === */}
      <div className="fichario__lista">
        <p className="fichario__rotulo" id="rotulo-fichario">
          SUAS CAIXAS
        </p>
        <div role="tablist" aria-labelledby="rotulo-fichario" aria-orientation="vertical" onKeyDown={aoApertarTecla}>
          {caixas.map((caixa) => {
            const ativa = caixa.id === atual.id;
            return (
              <button
                key={caixa.id}
                id={`aba-caixa-${caixa.id}`}
                type="button"
                role="tab"
                aria-selected={ativa}
                aria-controls="cartao-postal"
                tabIndex={ativa ? 0 : -1}
                className={juntarClasses("fichario__aba", ativa && "fichario__abaAtiva")}
                onClick={() => escolher(caixa.id)}
              >
                <span className="fichario__nomeCaixa">{caixa.nome}</span>
                <span className={juntarClasses("fichario__situacao", caixa.fotoId && "fichario__situacaoChegou")}>
                  {caixa.fotoId ? `Foto de ${caixa.enviadaEm}` : "Foto em breve"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <CartaoPostal key={atual.id} caixa={atual} eu={eu} />
    </div>
  );
}

// === Seção: Cartão-postal de uma caixa ===
function CartaoPostal({ caixa, eu }: { caixa: CaixaPostal; eu: PropsFichario["eu"] }) {
  const [todosItens, setTodosItens] = useState(false);
  const itens = todosItens ? caixa.itens : caixa.itens.slice(0, ITENS_VISIVEIS);
  const restantes = caixa.itens.length - itens.length;

  return (
    <article
      id="cartao-postal"
      className="postal"
      role="tabpanel"
      aria-labelledby={`aba-caixa-${caixa.id}`}
      tabIndex={-1}
    >
      <div className="postal__borda">
        {/* === Seção: Foto da GOM === */}
        <div className="postal__ladoFoto">
          {caixa.fotoId ? (
            <>
              <FotoItem publicId={caixa.fotoId} descricao={`Foto dos seus itens da ${caixa.nome}`} className="postal__foto" />
              <a href={enderecoDownload(caixa.fotoId)} className="postal__baixar" download>
                <IconeBaixar />
                Baixar foto
              </a>
            </>
          ) : (
            <div className="postal__fotoEmBreve">
              <IconeRelogio tamanho={22} />
              <span className="postal__fotoEmBreveTitulo">FOTO EM BREVE</span>
              <span>A GOM ainda vai tirar a foto dos seus itens.</span>
            </div>
          )}
        </div>

        <span className="postal__linha" aria-hidden="true" />

        {/* === Seção: Verso do cartão === */}
        <div className="postal__texto">
          <p className="postal__marca">LUCKY CEGS · POST CARD CO.</p>
          <h2 className="postal__titulo">{caixa.nome}</h2>
          <p className="postal__cursiva">chegou na casa da gom</p>
          <p className="postal__para">
            Para: {eu.nome} @{eu.user} <span className="postal__chegada">· chegou em {caixa.chegouEm}</span>
          </p>

          <ul className="postal__itens" aria-label="Seus itens nesta caixa (abre os detalhes)">
            {itens.map((item) => (
              <li key={item.id}>
                <BotaoDetalhes itemId={item.id} className="postal__item">
                  <IconeCoracao className="postal__coracao" tamanho={16} />
                  <span className="postal__nomeItem">{item.nome}</span>
                  <IconeSeta className="postal__setaItem" tamanho={14} />
                </BotaoDetalhes>
              </li>
            ))}
          </ul>
          {restantes > 0 && (
            <button type="button" className="postal__mais" onClick={() => setTodosItens(true)}>
              + {restantes} {restantes === 1 ? "item" : "itens"}
            </button>
          )}
          <p className="postal__dica">Toque num item para ver os detalhes.</p>
        </div>

        <Image src={carimboPostal} alt="" sizes="170px" className="postal__carimbo" />
      </div>
    </article>
  );
}
