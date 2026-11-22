import type { ItemCaixa, MinhaParte } from "@/lib/caixas";
import { ETAPAS_ITEM, type EtapaItem } from "@/lib/etapas";
import { descreverQuantidades, formatarDataCurta, formatarReais } from "@/lib/formatacao";

// === Seção: Tipos da janela de detalhes ===
export type AbaDetalhes = "fotos" | "status" | "pagamento";
export const ABAS_DETALHES: { id: AbaDetalhes; rotulo: string }[] = [
  { id: "fotos", rotulo: "Fotos" },
  { id: "status", rotulo: "Status" },
  { id: "pagamento", rotulo: "Pagamento" },
];

export type EtapaDetalhe = {
  id: EtapaItem;
  rotulo: string;
  descricao: string;
  data: string | null;
  estado: "feita" | "atual" | "futura";
};

export type LinhaPagamento = { rotulo: string; valor: string; pago: boolean };

// Tudo já formatado no servidor: a janela só desenha
export type DetalheItem = {
  id: number;
  nome: string;
  cabecalho: string;
  quantidades: string[];
  situacao: EtapaItem;
  fotoId: string | null;
  proofWhId: string | null;
  etapas: EtapaDetalhe[];
  pagamento: LinhaPagamento[];
  faltaPagar: string | null;
};

// === Seção: Montagem dos dados ===
export function montarDetalheItem(item: ItemCaixa, nomeCaixa: string): DetalheItem {
  const membros = item.minhasPartes.map((p) => p.membro).filter(Boolean);
  const cabecalho = [item.grupo, membros.join(", "), nomeCaixa].filter(Boolean).join(" · ");

  const indiceAtual = ETAPAS_ITEM.findIndex((etapa) => etapa.id === item.situacao);
  const etapas = ETAPAS_ITEM.map((etapa, indice): EtapaDetalhe => {
    // Data mais recente registrada para a etapa; a atual usa a última mudança como reserva
    const registro = item.historico.findLast((h) => h.situacao === etapa.id);
    const data = registro?.data ?? (indice === indiceAtual ? item.situacaoAtualizadaEm : null);
    return {
      id: etapa.id,
      rotulo: etapa.rotulo,
      descricao: etapa.descricao,
      data: indice <= indiceAtual && data ? formatarDataCurta(data) : null,
      estado: indice < indiceAtual ? "feita" : indice === indiceAtual ? "atual" : "futura",
    };
  });

  return {
    id: item.id,
    nome: item.nome,
    cabecalho,
    quantidades: descreverQuantidades(item),
    situacao: item.situacao,
    fotoId: item.fotoId,
    proofWhId: item.proofWhId,
    etapas,
    pagamento: [
      somarCampo(item.minhasPartes, "Item", "venda", "vendaPago"),
      somarCampo(item.minhasPartes, "Inter", "inter", "interPago"),
      somarCampo(item.minhasPartes, "Taxa", "taxa", "taxaPago"),
    ],
    faltaPagar: item.faltaPagar > 0 ? formatarReais(item.faltaPagar) : null,
  };
}

// Soma o campo de todas as partes do joiner no item; só fica "Pago" se todas estiverem pagas.
// Valor vazio em todas as partes = "a definir" ("-")
function somarCampo(
  partes: MinhaParte[],
  rotulo: string,
  campo: "venda" | "inter" | "taxa",
  campoPago: "vendaPago" | "interPago" | "taxaPago",
): LinhaPagamento {
  const valores = partes.map((p) => p[campo]).filter((v): v is number => v !== null);
  return {
    rotulo,
    valor: valores.length ? formatarReais(valores.reduce((total, v) => total + v, 0)) : "-",
    pago: partes.length > 0 && partes.every((p) => p[campoPago]),
  };
}
