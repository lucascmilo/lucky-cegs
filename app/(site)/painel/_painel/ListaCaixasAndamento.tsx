"use client";

import Link from "next/link";
import { useState } from "react";
import { ETAPAS_CAIXA, obterEtapaCaixa } from "@/lib/etapas";
import type { CaixaAndamento } from "@/lib/painel";

const POR_VEZ = 3;

// === Seção: Caixas em andamento ===
// Mostra 3 caixas; "Ver mais" mostra mais 3 a cada clique
export default function ListaCaixasAndamento({ caixas }: { caixas: CaixaAndamento[] }) {
  const [mostrar, setMostrar] = useState(POR_VEZ);
  const restantes = Math.max(0, caixas.length - mostrar);

  if (caixas.length === 0) {
    return (
      <div className="andamento__vazio">
        <p className="andamento__vazioEtiqueta">NENHUMA CAIXA A CAMINHO</p>
        <p>Todas as caixas já chegaram na sua casa.</p>
        <Link href="/caixas?nova=1" className="botao botao__preto">
          + Nova caixa
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="andamento">
        {caixas.slice(0, mostrar).map((caixa) => {
          const etapa = obterEtapaCaixa(caixa.situacao);
          return (
            <li key={caixa.id}>
              <Link href={`/caixas/${caixa.id}`} className="andamento__cartao">
                <span className="andamento__nome">{caixa.nome}</span>
                <span
                  className="pilulaEtapa andamento__etapa"
                  style={{ backgroundColor: etapa.cor }}
                >
                  {etapa.rotulo}
                </span>
                <span
                  className="andamento__progresso"
                  role="img"
                  aria-label={`Etapa ${etapa.numero} de ${ETAPAS_CAIXA.length}: ${etapa.rotulo}`}
                >
                  {ETAPAS_CAIXA.map((item, indice) => (
                    <span
                      key={item.id}
                      className={
                        indice < etapa.numero ? "andamento__barraCheia" : "andamento__barra"
                      }
                    />
                  ))}
                </span>
                <span className="andamento__itens">
                  {caixa.totalItens} {caixa.totalItens === 1 ? "item" : "itens"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {restantes > 0 && (
        <button
          type="button"
          className="botao botao__contorno andamento__verMais"
          onClick={() => setMostrar((n) => n + POR_VEZ)}
        >
          Ver mais {Math.min(restantes, POR_VEZ)}
          {restantes > POR_VEZ && ` de ${restantes}`}
        </button>
      )}
    </>
  );
}