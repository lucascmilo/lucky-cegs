import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { caixa, parte, registro } from "@/db/schema";
import type { EtapaCaixa } from "@/lib/etapas";

// === Seção: Tipos ===
export type CaixaResumo = {
  id: number;
  nome: string;
  origem: string | null;
  situacao: EtapaCaixa;
  situacaoAtualizadaEm: Date;
  seusItens: number;
  totalItens: number;
};

// === Seção: Falta pagar ===
type ValoresParte = {
  venda: string | number | null;
  inter: string | number | null;
  taxa: string | number | null;
  vendaPago: boolean;
  interPago: boolean;
  taxaPago: boolean;
};

// Soma venda, inter e taxa ainda não pagos de uma parte (valores "a definir" ficam de fora)
export function somarNaoPago(p: ValoresParte) {
  let total = 0;
  if (!p.vendaPago && p.venda !== null) total += Number(p.venda);
  if (!p.interPago && p.inter !== null) total += Number(p.inter);
  if (!p.taxaPago && p.taxa !== null) total += Number(p.taxa);
  return total;
}

export async function obterFaltaPagar(userId: string) {
  const partes = await db
    .select({
      venda: parte.venda,
      inter: parte.inter,
      taxa: parte.taxa,
      vendaPago: parte.vendaPago,
      interPago: parte.interPago,
      taxaPago: parte.taxaPago,
    })
    .from(parte)
    .where(eq(parte.userId, userId));

  return partes.reduce((total, p) => total + somarNaoPago(p), 0);
}

// === Seção: Caixas mais recentes do joiner ===
// "Seus itens" conta as partes do joiner na caixa (num set de 7 pcs, 2 partes = 2 itens);
// o total soma qtd_itens de todos os registros da caixa.
export async function obterCaixasRecentes(userId: string, limite = 4): Promise<CaixaResumo[]> {
  const itensPorCaixa = await db
    .select({ caixaId: registro.caixaId, seusItens: sql<number>`count(${parte.id})::int` })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .where(eq(parte.userId, userId))
    .groupBy(registro.caixaId);

  if (itensPorCaixa.length === 0) return [];

  const caixas = await db
    .select({
      id: caixa.id,
      nome: caixa.nome,
      origem: caixa.origem,
      situacao: caixa.situacao,
      situacaoAtualizadaEm: caixa.situacaoAtualizadaEm,
      totalItens: sql<number>`coalesce(sum(${registro.qtdItens}), 0)::int`,
    })
    .from(caixa)
    .leftJoin(registro, eq(registro.caixaId, caixa.id))
    .where(
      inArray(
        caixa.id,
        itensPorCaixa.map((item) => item.caixaId),
      ),
    )
    .groupBy(caixa.id)
    .orderBy(desc(caixa.situacaoAtualizadaEm))
    .limit(limite);

  const seusPorCaixa = new Map(itensPorCaixa.map((item) => [item.caixaId, item.seusItens]));
  return caixas.map((c) => ({ ...c, seusItens: seusPorCaixa.get(c.id) ?? 0 }));
}
