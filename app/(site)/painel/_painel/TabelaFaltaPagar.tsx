"use client";

import { useState } from "react";
import { formatarReais } from "@/lib/formatacao";
import type { JoinerDevendo, ValorDevido } from "@/lib/painel";

const POR_VEZ = 5;

function Valor({ valor }: { valor: ValorDevido }) {
  if (valor === null) return <>-</>;
  if (valor === "emBreve") return <span className="faltaPagar__emBreve">em breve</span>;
  return <>{formatarReais(valor)}</>;
}

// === Seção: Tabela "Quem falta pagar" ===
// Mostra 5 pessoas; "Ver mais" mostra mais 5 a cada clique
export default function TabelaFaltaPagar({ pessoas }: { pessoas: JoinerDevendo[] }) {
  const [mostrar, setMostrar] = useState(POR_VEZ);
  const restantes = pessoas.length - mostrar;
  const visiveis = pessoas.slice(0, mostrar);
  const totalReceber = pessoas.reduce((soma, pessoa) => soma + pessoa.total, 0);

  if (pessoas.length === 0) {
    return (
      <div className="faltaPagar faltaPagar__vazio">
        <span className="espiralCaderno" aria-hidden="true" />
        <p className="faltaPagar__vazioEtiqueta">NINGUÉM DEVENDO</p>
        <p>Todos os valores lançados já foram pagos.</p>
      </div>
    );
  }

  return (
    <div className="faltaPagar">
      <span className="espiralCaderno" aria-hidden="true" />
      <table className="faltaPagar__tabela">
        <thead>
          <tr>
            <th scope="col">Joiner</th>
            <th scope="col">Item</th>
            <th scope="col">Inter</th>
            <th scope="col">Taxa</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {visiveis.map((pessoa) => (
            <tr key={pessoa.userId}>
              <th scope="row">
                <span className="faltaPagar__user">@{pessoa.user}</span> {pessoa.nome}
              </th>
              <td>
                <Valor valor={pessoa.item} />
              </td>
              <td>
                <Valor valor={pessoa.inter} />
              </td>
              <td>
                <Valor valor={pessoa.taxa} />
              </td>
              <td className="faltaPagar__total">{formatarReais(pessoa.total)}</td>
            </tr>
          ))}
          {/* Com poucas pessoas, linhas em branco mantêm a folha do caderno do mesmo tamanho */}
          {Array.from({ length: Math.max(0, POR_VEZ - visiveis.length) }, (_, indice) => (
            <tr key={`vazia-${indice}`} className="faltaPagar__linhaVazia" aria-hidden="true">
              <td colSpan={5} />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={4}>
              A receber de {pessoas.length} {pessoas.length === 1 ? "joiner" : "joiners"}
            </th>
            <td className="faltaPagar__total">{formatarReais(totalReceber)}</td>
          </tr>
        </tfoot>
      </table>

      {restantes > 0 && (
        <button
          type="button"
          className="botao botao__contorno faltaPagar__verMais"
          onClick={() => setMostrar((n) => n + POR_VEZ)}
        >
          Ver mais {Math.min(restantes, POR_VEZ)} de {restantes}
        </button>
      )}
    </div>
  );
}
