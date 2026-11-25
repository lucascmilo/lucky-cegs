"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import FotoItem from "@/componentes/FotoItem";
import { IconeBaixar, IconeCoracao, IconeRelogio, IconeSeta } from "@/componentes/Icones";
import { BotaoDetalhes } from "@/componentes/JanelaDetalhes";
import { enderecoDownload } from "@/lib/cloudinary";
import carimboPostal from "@/public/imagens/carimbo-postal.svg";

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

const ITENS_VISIVEIS = 4;

// === Seção: Cartão-postal de uma caixa ===
// "semFoto" troca o aviso "Foto em breve" (ex.: a área de envio da GOM); "acoes" entra embaixo do verso.
// Com "idAba", o cartão é o painel da aba daquela caixa.
type PropsCartaoPostal = {
  caixa: CaixaPostal;
  para: { nome: string; user: string };
  descricaoFoto: string;
  idAba?: string;
  semFoto?: ReactNode;
  acoes?: ReactNode;
};

export default function CartaoPostal({
  caixa,
  para,
  descricaoFoto,
  idAba,
  semFoto,
  acoes,
}: PropsCartaoPostal) {
  const [todosItens, setTodosItens] = useState(false);
  const itens = todosItens ? caixa.itens : caixa.itens.slice(0, ITENS_VISIVEIS);
  const restantes = caixa.itens.length - itens.length;

  return (
    <article
      id="cartao-postal"
      className="postal"
      role={idAba ? "tabpanel" : undefined}
      aria-labelledby={idAba}
      tabIndex={idAba ? -1 : undefined}
    >
      <div className="postal__borda">
        {/* === Seção: Foto da GOM === */}
        <div className="postal__ladoFoto">
          {caixa.fotoId ? (
            <>
              <FotoItem
                publicId={caixa.fotoId}
                descricao={descricaoFoto}
                className="postal__foto"
              />
              <a href={enderecoDownload(caixa.fotoId)} className="postal__baixar" download>
                <IconeBaixar aria-hidden="true" />
                Baixar foto
              </a>
            </>
          ) : (
            (semFoto ?? (
              <div className="postal__fotoEmBreve">
                <IconeRelogio tamanho={22} aria-hidden="true" />
                <span className="postal__fotoEmBreveTitulo">FOTO EM BREVE</span>
                <span>A GOM ainda vai tirar a foto dos seus itens.</span>
              </div>
            ))
          )}
        </div>

        <span className="postal__linha" aria-hidden="true" />

        {/* === Seção: Verso do cartão === */}
        <div className="postal__texto">
          <p className="postal__marca">LUCKY CEGS · POST CARD CO.</p>
          <h2 className="postal__titulo">{caixa.nome}</h2>
          <p className="postal__cursiva">chegou na casa da gom</p>
          <p className="postal__para">
            Para: {para.nome} @{para.user}{" "}
            <span className="postal__chegada">· chegou em {caixa.chegouEm}</span>
          </p>

          <ul className="postal__itens" aria-label="Seus itens nesta caixa (abre os detalhes)">
            {itens.map((item) => (
              <li key={item.id}>
                <BotaoDetalhes itemId={item.id} className="postal__item">
                  <IconeCoracao className="postal__coracao" tamanho={16} aria-hidden="true" />
                  <span className="postal__nomeItem">{item.nome}</span>
                  <IconeSeta className="postal__setaItem" tamanho={14} aria-hidden="true" />
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
          {acoes && <div className="postal__acoes">{acoes}</div>}
        </div>

        <Image
          src={carimboPostal}
          alt=""
          sizes="170px"
          className="postal__carimbo"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}