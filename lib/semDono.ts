import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { caixa, claim, registro } from "@/db/schema";
import { etapaItemNaCaixa, type EtapaItem } from "@/lib/etapas";

// === Seção: Tipos ===
export type ItemSemDono = {
  id: number;
  nome: string;
  grupo: string | null;
  membro: string | null;
  situacao: EtapaItem;
  fotoId: string | null;
  proofWhId: string | null;
  preco: number | null;
  nomeCaixa: string;
  // O joiner atual já pediu este item e a GOM ainda não respondeu
  pedidoEnviado: boolean;
};

// === Seção: Texto embaixo do preço ===
// O que ainda falta pagar além do preço depende de onde o item está
export function textoCustosExtras(situacao: EtapaItem) {
  if (situacao === "casa_gom") return "+ frete nacional";
  if (situacao === "otw" || situacao === "brasil") return "+ frete e taxa";
  return "+ fretes e taxa";
}

// === Seção: Itens sem dono ===
// Todos os itens marcados como sem dono, de todas as caixas, menos os que já tiveram claim aceito
export async function obterItensSemDono(userId: string | null): Promise<ItemSemDono[]> {
  const itens = await db
    .select({
      id: registro.id,
      nome: registro.nome,
      grupo: registro.grupo,
      membro: registro.membro,
      situacao: registro.situacao,
      fotoId: registro.fotoId,
      proofWhId: registro.proofWhId,
      preco: registro.precoSemDono,
      nomeCaixa: caixa.nome,
      situacaoCaixa: caixa.situacao,
    })
    .from(registro)
    .innerJoin(caixa, eq(registro.caixaId, caixa.id))
    .where(
      and(
        eq(registro.semDono, true),
        sql`not exists (select 1 from ${claim} where ${claim.registroId} = ${registro.id} and ${claim.status} = 'aceito')`,
      ),
    )
    .orderBy(desc(caixa.criadaEm), registro.id);

  if (itens.length === 0) return [];

  // Pedidos do joiner que ainda esperam resposta da GOM
  const pedidos = userId
    ? await db
        .select({ registroId: claim.registroId })
        .from(claim)
        .where(
          and(
            eq(claim.userId, userId),
            eq(claim.status, "pedido"),
            inArray(
              claim.registroId,
              itens.map((item) => item.id),
            ),
          ),
        )
    : [];
  const pedidosEnviados = new Set(pedidos.map((p) => p.registroId));

  return itens.map(({ situacaoCaixa, ...item }) => ({
    ...item,
    situacao: etapaItemNaCaixa(item.situacao, situacaoCaixa),
    preco: item.preco === null ? null : Number(item.preco),
    pedidoEnviado: pedidosEnviados.has(item.id),
  }));
}
