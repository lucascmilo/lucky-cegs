"use client";

import { useState, type KeyboardEvent } from "react";
import CartaoPostal, { type CaixaPostal } from "@/componentes/CartaoPostal";
import { juntarClasses } from "@/lib/classes";

// === Seção: Tipos ===
type PropsFichario = {
  caixas: CaixaPostal[];
  eu: { nome: string; user: string };
  caixaInicial: number | null;
};

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

      <CartaoPostal
        key={atual.id}
        caixa={atual}
        para={eu}
        descricaoFoto={`Foto dos seus itens da ${atual.nome}`}
        idAba={`aba-caixa-${atual.id}`}
      />
    </div>
  );
}
