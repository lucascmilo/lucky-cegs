"use client";

import { type CSSProperties } from "react";
import { IconeLapis } from "@/componentes/Icones";
import { juntarClasses } from "@/lib/classes";
import { obterEtapaItem, type EtapaItem } from "@/lib/etapas";
import { CATEGORIAS, type ParteGom, type Quantidades } from "@/lib/planilhaCaixa";

// === Seção: Peças da tabela ===
// Bolinha com a cor da etapa; o nome da etapa fica no texto escondido e na dica ao passar o mouse
export function BolinhaEtapa({ situacao }: { situacao: EtapaItem }) {
  const etapa = obterEtapaItem(situacao);
  return (
    <span className="planilhaGom__corEtapa" style={{ "--cor-etapa": etapa.cor } as CSSProperties} title={etapa.rotulo}>
      <span className="somenteLeitorTela">{etapa.rotulo}: </span>
    </span>
  );
}

export function LinhaParte({ parte, marcado }: { parte: ParteGom; marcado: boolean }) {
  return (
    <tr className={juntarClasses("planilhaGom__linhaParte", marcado && "planilhaGom__selecionada")}>
      <td className="planilhaGom__celulaMarcar" />
      <td className="planilhaGom__celulaFotos" />
      <td className="planilhaGom__membro planilhaGom__alinharEsquerda">{parte.membro ?? <Vazio />}</td>
      <td data-rotulo="Joiner" className="planilhaGom__joiner planilhaGom__alinharEsquerda">
        @{parte.user}
      </td>
      <td data-rotulo="Valor">
        <ValorPago valor={parte.venda} pago={parte.vendaPago} />
      </td>
      <td className="planilhaGom__celulaVazia" />
      <td data-rotulo="Inter">
        <ValorPago valor={parte.inter} pago={parte.interPago} />
      </td>
      <td data-rotulo="Taxa">
        <ValorPago valor={parte.taxa} pago={parte.taxaPago} />
      </td>
      <td className="planilhaGom__celulaVazia" />
      <CelulasQuantidade quantidades={parte.quantidades} />
    </tr>
  );
}

export function CelulasQuantidade({ quantidades }: { quantidades: Quantidades }) {
  return CATEGORIAS.map((categoria) => (
    <td
      key={categoria.id}
      data-rotulo={categoria.sigla}
      className={juntarClasses("planilhaGom__qtd", quantidades[categoria.id] === 0 && "planilhaGom__zero")}
    >
      {quantidades[categoria.id]}
    </td>
  ));
}

// Verde = pago, vermelho = a pagar (o texto escondido diz o mesmo para leitores de tela)
export function ValorPago({ valor, pago }: { valor: number | null; pago: boolean }) {
  if (valor === null) return <Vazio rotulo="A definir" />;
  return (
    <span className={pago ? "planilhaGom__pago" : "planilhaGom__aPagar"}>
      <Dinheiro valor={valor} />
      <span className="somenteLeitorTela">{pago ? " (pago)" : " (a pagar)"}</span>
    </span>
  );
}

export function Vazio({ rotulo = "Vazio" }: { rotulo?: string }) {
  return (
    <span className="planilhaGom__vazio" aria-label={rotulo}>
      -
    </span>
  );
}

export function formatarDinheiro(valor: number | null) {
  return valor === null ? <Vazio /> : <Dinheiro valor={valor} />;
}

// "R$" e o número separados: com valores muito altos, o número desce para a linha de baixo
// em vez de invadir a coluna vizinha
const formatadorValor = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatadorKg = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export function Dinheiro({ valor }: { valor: number }) {
  return (
    <span className="planilhaGom__dinheiro">
      <span className="planilhaGom__moeda">R$</span>
      <wbr />
      <span className="planilhaGom__numero">{formatadorValor.format(valor)}</span>
    </span>
  );
}

export function formatarKg(kg: number | null) {
  return kg === null ? <Vazio /> : formatadorKg.format(kg);
}

// === Seção: Caixa de marcar ===
// A área de toque é a célula inteira; a caixa desenhada fica no meio
type PropsMarcar = { marcado: boolean; parcial?: boolean; aoMudar: () => void; rotulo: string; desabilitado?: boolean };

export function Marcar({ marcado, parcial = false, aoMudar, rotulo, desabilitado }: PropsMarcar) {
  return (
    <label className="planilhaGom__areaMarcar">
      <input
        type="checkbox"
        className="planilhaGom__marcar"
        checked={marcado}
        ref={(caixa) => {
          if (caixa) caixa.indeterminate = parcial;
        }}
        onChange={aoMudar}
        disabled={desabilitado}
        aria-label={rotulo}
      />
    </label>
  );
}


export function BotaoEditar({ nome, aoClicar }: { nome: string; aoClicar: () => void }) {
  return (
    <button type="button" className="planilhaGom__editar" onClick={aoClicar} aria-label={`Editar ${nome}`} title="Editar item">
      <IconeLapis />
    </button>
  );
}
