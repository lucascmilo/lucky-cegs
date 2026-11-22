import type { situacao, situacaoCaixa } from "@/db/schema";

// === Seção: Etapas da caixa (4) ===
export type EtapaCaixa = (typeof situacaoCaixa.enumValues)[number];

export const ETAPAS_CAIXA: { id: EtapaCaixa; rotulo: string; cor: string }[] = [
  { id: "warehouse", rotulo: "Na warehouse", cor: "#ffe27a" },
  { id: "otw", rotulo: "OTW Brasil", cor: "#bfd9f2" },
  { id: "brasil", rotulo: "No Brasil", cor: "#9fe3d2" },
  { id: "casa_gom", rotulo: "Na casa da GOM", cor: "#ec4f79" },
];

// A taxa só é definida depois da alfândega, quando a caixa já está no Brasil
export function taxaDefinida(situacao: EtapaCaixa) {
  return situacao === "brasil" || situacao === "casa_gom";
}

export function obterEtapaCaixa(id: EtapaCaixa) {
  const indice = ETAPAS_CAIXA.findIndex((etapa) => etapa.id === id);
  return { ...ETAPAS_CAIXA[indice], numero: indice + 1 };
}

// === Seção: Etapas do item (6) ===
export type EtapaItem = (typeof situacao.enumValues)[number];

// "descricao" aparece no quadro "ETAPA ATUAL" da janela de detalhes
export const ETAPAS_ITEM: { id: EtapaItem; rotulo: string; cor: string; descricao: string }[] = [
  {
    id: "esperando",
    rotulo: "Esperando a warehouse comprar",
    cor: "#e2dcf5",
    descricao: "Seu pedido está na fila. A warehouse ainda vai fazer a compra do item.",
  },
  {
    id: "comprado",
    rotulo: "Comprado",
    cor: "#cdeebb",
    descricao: "A warehouse já comprou o item. Agora é esperar ele chegar até ela.",
  },
  {
    id: "warehouse",
    rotulo: "Na warehouse",
    cor: "#ffe27a",
    descricao: "O item chegou na warehouse e espera o resto da caixa para ser enviado.",
  },
  {
    id: "otw",
    rotulo: "OTW Brasil",
    cor: "#bfd9f2",
    descricao: "A caixa saiu da warehouse e está a caminho do Brasil.",
  },
  {
    id: "brasil",
    rotulo: "No Brasil",
    cor: "#9fe3d2",
    descricao: "A caixa já passou pela alfândega e está no Brasil, a caminho da GOM.",
  },
  {
    id: "casa_gom",
    rotulo: "Na casa da GOM",
    cor: "#ec4f79",
    descricao: "A caixa chegou! A GOM vai tirar uma foto geral dos seus itens e combina o envio com você.",
  },
];

export function obterEtapaItem(id: EtapaItem) {
  return ETAPAS_ITEM.find((etapa) => etapa.id === id) ?? ETAPAS_ITEM[0];
}

// === Seção: Etapa do item conforme a caixa ===
// Com a caixa na warehouse, o item fica em "esperando", "comprado" ou "warehouse".
// Depois disso o item acompanha a caixa (OTW, No Brasil, Na casa da GOM).
const ETAPAS_ANTES_DE_SAIR: EtapaItem[] = ["esperando", "comprado", "warehouse"];

export function etapaItemNaCaixa(etapaItem: EtapaItem, etapaCaixa: EtapaCaixa): EtapaItem {
  if (etapaCaixa !== "warehouse") return etapaCaixa;
  return ETAPAS_ANTES_DE_SAIR.includes(etapaItem) ? etapaItem : "warehouse";
}
