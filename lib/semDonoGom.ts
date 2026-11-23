import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, claim, registro } from "@/db/schema";
import { formatarMomento } from "@/lib/formatacao";

// Tudo aqui é só para a GOM: quem chama precisa ter passado por exigirGom().

// === Seção: Tipos ===
type PedidoClaim = { userId: string; user: string; quando: string };

export type ItemSemDonoGom = {
  id: number;
  nome: string;
  nomeCaixa: string;
  preco: number | null;
  fotoId: string | null;
  proofWhId: string | null;
  // Pedidos ainda sem resposta, do mais antigo para o mais novo
  pedidos: PedidoClaim[];
};

export type SemDonoGom = {
  itens: ItemSemDonoGom[];
  // Itens sem nenhum pedido esperando
  itensLivres: number;
  pedidosEsperando: number;
};

// === Seção: Itens sem dono com os pedidos de claim ===
// Os itens com pedido esperando vêm primeiro; depois, da caixa mais recente para a mais antiga
export async function obterSemDonoGom(): Promise<SemDonoGom> {
  const registros = await db
    .select({
      id: registro.id,
      nome: registro.nome,
      nomeCaixa: caixa.nome,
      preco: registro.precoSemDono,
      fotoId: registro.fotoId,
      proofWhId: registro.proofWhId,
    })
    .from(registro)
    .innerJoin(caixa, eq(registro.caixaId, caixa.id))
    .where(
      and(
        eq(registro.semDono, true),
        sql`not exists (select 1 from ${claim} where ${claim.registroId} = ${registro.id} and ${claim.status} = 'aceito')`,
      ),
    )
    .orderBy(desc(caixa.criadaEm), asc(registro.id));

  if (registros.length === 0) return { itens: [], itensLivres: 0, pedidosEsperando: 0 };

  const pedidos = await db
    .select({ registroId: claim.registroId, userId: claim.userId, user: user.username, criadoEm: claim.criadoEm })
    .from(claim)
    .innerJoin(user, eq(claim.userId, user.id))
    .where(
      and(
        eq(claim.status, "pedido"),
        inArray(
          claim.registroId,
          registros.map((r) => r.id),
        ),
      ),
    )
    .orderBy(asc(claim.criadoEm));

  const agora = new Date();
  const itens = registros.map((r) => ({
    ...r,
    preco: r.preco === null ? null : Number(r.preco),
    pedidos: pedidos
      .filter((p) => p.registroId === r.id)
      .map((p) => ({ userId: p.userId, user: p.user ?? "", quando: formatarMomento(p.criadoEm, agora) })),
  }));

  // sort é estável: dentro de cada grupo, a ordem das caixas se mantém
  itens.sort((a, b) => Number(b.pedidos.length > 0) - Number(a.pedidos.length > 0));

  return {
    itens,
    itensLivres: itens.filter((item) => item.pedidos.length === 0).length,
    pedidosEsperando: pedidos.length,
  };
}
