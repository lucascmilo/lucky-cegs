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

type EtapaDetalhe = {
  id: EtapaItem;
  rotulo: string;
  descricao: string;
  data: string | null;
  estado: "feita" | "atual" | "futura";
};

// "emBreve": o valor ainda não existe (a GOM ainda não lançou). "pendente": tem valor e não foi pago
export type EstadoPagamento = "pago" | "pendente" | "emBreve";

export function estadoDoValor(valor: number | null, pago: boolean): EstadoPagamento {
  if (pago) return "pago";
  return valor === null ? "emBreve" : "pendente";
}
type LinhaPagamento = { rotulo: string; valor: string; estado: EstadoPagamento };

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
  // Sem nada pendente (o que ainda não existe não conta): aparece como pago
  tudoPago: boolean;
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

  const pagamento = linhasPagamento(item.minhasPartes);

  return {
    id: item.id,
    nome: item.nome,
    cabecalho,
    quantidades: quantidadesDoJoiner(item),
    situacao: item.situacao,
    fotoId: item.fotoId,
    proofWhId: item.proofWhId,
    etapas,
    pagamento,
    faltaPagar: item.faltaPagar > 0 ? formatarReais(item.faltaPagar) : null,
    tudoPago: pagamento.every((linha) => linha.estado !== "pendente"),
  };
}

// Item, inter e taxa somados das partes do joiner
function linhasPagamento(partes: MinhaParte[]): LinhaPagamento[] {
  return [
    somarCampo(partes, "Item", "venda", "vendaPago"),
    somarCampo(partes, "Inter", "inter", "interPago"),
    somarCampo(partes, "Taxa", "taxa", "taxaPago"),
  ];
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
  const pago = partes.length > 0 && partes.every((p) => p[campoPago]);
  const soma = valores.length ? valores.reduce((total, v) => total + v, 0) : null;
  return {
    rotulo,
    valor: soma === null ? "-" : formatarReais(soma),
    estado: estadoDoValor(soma, pago),
  };
}

// === Seção: Quantidade que fica com o joiner ===
// Num set dividido, soma as partes do joiner e mostra junto do total ("2 de 7 PCS")
function quantidadesDoJoiner(item: ItemCaixa) {
  const total = descreverQuantidades(item);
  if (item.totalPessoas < 2 || item.minhasPartes.length === 0) return total;

  const somar = (campo: "qtdPc" | "qtdPostcard" | "qtdSmini" | "qtdAlbum") =>
    item.minhasPartes.reduce((soma, parte) => soma + parte[campo], 0);
  const minhas = { qtdPc: somar("qtdPc"), qtdPostcard: somar("qtdPostcard"), qtdSmini: somar("qtdSmini"), qtdAlbum: somar("qtdAlbum") };
  // Partes antigas, de antes da quantidade por pessoa, ficam zeradas: aí só o total aparece
  if (Object.values(minhas).every((valor) => valor === 0)) return total;

  const campos = ["qtdPc", "qtdPostcard", "qtdSmini", "qtdAlbum"] as const;
  return campos
    .filter((campo) => item[campo] > 0)
    .map((campo) => {
      const [texto] = descreverQuantidades({ qtdPc: 0, qtdPostcard: 0, qtdSmini: 0, qtdAlbum: 0, [campo]: item[campo] });
      return `${minhas[campo]} de ${texto}`;
    });
}
