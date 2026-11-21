import type { situacao, situacaoCaixa } from "@/db/schema";

// === Seção: Etapas da caixa (5) ===
export type EtapaCaixa = (typeof situacaoCaixa.enumValues)[number];

export const ETAPAS_CAIXA: { id: EtapaCaixa; rotulo: string; cor: string }[] = [
  { id: "warehouse", rotulo: "Na warehouse", cor: "#ffe27a" },
  { id: "otw", rotulo: "OTW Brasil", cor: "#bfd9f2" },
  { id: "brasil", rotulo: "No Brasil", cor: "#9fe3d2" },
  { id: "esperando_taxa", rotulo: "Esperando taxa", cor: "#ffc9a3" },
  { id: "casa_gom", rotulo: "Na casa da GOM", cor: "#ec4f79" },
];

export function obterEtapaCaixa(id: EtapaCaixa) {
  const indice = ETAPAS_CAIXA.findIndex((etapa) => etapa.id === id);
  return { ...ETAPAS_CAIXA[indice], numero: indice + 1 };
}

// === Seção: Etapas do item (6) ===
export type EtapaItem = (typeof situacao.enumValues)[number];

export const ETAPAS_ITEM: { id: EtapaItem; rotulo: string; cor: string }[] = [
  { id: "esperando", rotulo: "Esperando a warehouse comprar", cor: "#e2dcf5" },
  { id: "comprado", rotulo: "Comprado", cor: "#cdeebb" },
  { id: "warehouse", rotulo: "Na warehouse", cor: "#ffe27a" },
  { id: "otw", rotulo: "OTW Brasil", cor: "#bfd9f2" },
  { id: "brasil", rotulo: "No Brasil", cor: "#9fe3d2" },
  { id: "casa_gom", rotulo: "Na casa da GOM", cor: "#ec4f79" },
];

export function obterEtapaItem(id: EtapaItem) {
  return ETAPAS_ITEM.find((etapa) => etapa.id === id) ?? ETAPAS_ITEM[0];
}
