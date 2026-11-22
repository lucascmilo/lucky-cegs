import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { caixa, proofGom } from "@/db/schema";
import { obterMeusItens, type CaixaComMeusItens } from "@/lib/meusItens";

// === Seção: Tipos ===
export type ProofDaCaixa = { fotoId: string; enviadaEm: Date };
export type CaixaNaCasa = CaixaComMeusItens & { chegouEm: Date; proof: ProofDaCaixa | null };

// === Seção: Caixas do joiner que chegaram na casa da GOM ===
// Cada joiner vê só a própria proof de cada caixa.
export async function obterCaixasNaCasa(userId: string): Promise<CaixaNaCasa[]> {
  const caixas = await obterMeusItens(userId, "casa_gom");
  if (caixas.length === 0) return [];

  const ids = caixas.map((grupo) => grupo.caixa.id);
  // A caixa chegou quando passou para "Na casa da GOM"
  const chegadas = await db
    .select({ id: caixa.id, chegouEm: caixa.situacaoAtualizadaEm })
    .from(caixa)
    .where(inArray(caixa.id, ids));
  const chegouEm = new Map(chegadas.map((c) => [c.id, c.chegouEm]));

  const proofs = await db
    .select({ caixaId: proofGom.caixaId, fotoId: proofGom.fotoId, enviadaEm: proofGom.criadaEm })
    .from(proofGom)
    .where(and(eq(proofGom.userId, userId), inArray(proofGom.caixaId, ids)));
  const porCaixa = new Map(proofs.map((proof) => [proof.caixaId, proof]));

  return caixas.map((grupo) => {
    const proof = porCaixa.get(grupo.caixa.id);
    return {
      ...grupo,
      chegouEm: chegouEm.get(grupo.caixa.id) ?? new Date(),
      proof: proof ? { fotoId: proof.fotoId, enviadaEm: proof.enviadaEm } : null,
    };
  });
}
