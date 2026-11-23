import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { caixa, proofGom } from "@/db/schema";
import { obterItensCaixa, type ItemCaixa } from "@/lib/caixas";

// Tudo aqui é só para a GOM: quem chama precisa ter passado por exigirGom().

// === Seção: Tipos ===
export type CaixaComProofs = { id: number; nome: string };

type JoinerDaCaixa = {
  userId: string;
  nome: string;
  user: string;
  itens: { id: number; nome: string }[];
  proof: { fotoId: string; enviadaEm: Date } | null;
};

export type ProofsDaCaixa = {
  caixa: CaixaComProofs & { chegouEm: Date };
  // Itens da caixa, para a janela de detalhes (só as fotos)
  itens: ItemCaixa[];
  // Quem está com "falta" vem primeiro; depois em ordem alfabética
  joiners: JoinerDaCaixa[];
};

// === Seção: Caixas na casa da GOM ===
// Da que chegou mais recentemente para a mais antiga; as já entregues continuam na lista
export async function obterCaixasComProofs(): Promise<CaixaComProofs[]> {
  return db
    .select({ id: caixa.id, nome: caixa.nome })
    .from(caixa)
    .where(eq(caixa.situacao, "casa_gom"))
    .orderBy(desc(caixa.situacaoAtualizadaEm), desc(caixa.id));
}

// === Seção: Joiners e proofs de uma caixa ===
export async function obterProofsDaCaixa(caixaId: number, gomId: string): Promise<ProofsDaCaixa | null> {
  const [dados] = await db
    .select({ id: caixa.id, nome: caixa.nome, situacao: caixa.situacao, chegouEm: caixa.situacaoAtualizadaEm })
    .from(caixa)
    .where(eq(caixa.id, caixaId));
  if (!dados || dados.situacao !== "casa_gom") return null;

  // A GOM não tem partes: todas as pessoas do item aparecem em "outrasPessoas"
  const [itens, proofs] = await Promise.all([
    obterItensCaixa(caixaId, gomId),
    db
      .select({ userId: proofGom.userId, fotoId: proofGom.fotoId, enviadaEm: proofGom.criadaEm })
      .from(proofGom)
      .where(eq(proofGom.caixaId, caixaId))
      .orderBy(asc(proofGom.id)),
  ]);
  const proofPorJoiner = new Map(proofs.map((p) => [p.userId, p]));

  const porJoiner = new Map<string, JoinerDaCaixa>();
  for (const item of itens) {
    for (const pessoa of item.outrasPessoas) {
      const proof = proofPorJoiner.get(pessoa.userId);
      const joiner = porJoiner.get(pessoa.userId) ?? {
        userId: pessoa.userId,
        nome: pessoa.nome,
        user: pessoa.user,
        itens: [],
        proof: proof ? { fotoId: proof.fotoId, enviadaEm: proof.enviadaEm } : null,
      };
      joiner.itens.push({ id: item.id, nome: item.nome });
      porJoiner.set(pessoa.userId, joiner);
    }
  }

  const joiners = [...porJoiner.values()].sort(
    (a, b) => Number(a.proof !== null) - Number(b.proof !== null) || a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return { caixa: { id: dados.id, nome: dados.nome, chegouEm: dados.chegouEm }, itens, joiners };
}
