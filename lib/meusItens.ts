import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { caixa, parte, registro } from "@/db/schema";
import { obterItensCaixa, type DetalheCaixa, type ItemCaixa } from "@/lib/caixas";

// === Seção: Tipos ===
export type CaixaComMeusItens = { caixa: DetalheCaixa; itens: ItemCaixa[] };

// === Seção: Itens do joiner agrupados por caixa ===
// Da caixa mais recente para a mais antiga. Valores e pagamentos são só das partes do próprio joiner.
export async function obterMeusItens(userId: string): Promise<CaixaComMeusItens[]> {
  const idsCaixas = db
    .selectDistinct({ id: registro.caixaId })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .where(eq(parte.userId, userId));

  const caixas = await db
    .select({ id: caixa.id, nome: caixa.nome, origem: caixa.origem, situacao: caixa.situacao })
    .from(caixa)
    .where(inArray(caixa.id, idsCaixas))
    .orderBy(desc(caixa.criadaEm));

  const grupos = await Promise.all(
    caixas.map(async (atual) => ({
      caixa: atual,
      itens: (await obterItensCaixa(atual.id, userId)).filter((item) => item.minhasPartes.length > 0),
    })),
  );
  return grupos.filter((grupo) => grupo.itens.length > 0);
}
