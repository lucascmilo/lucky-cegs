import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { cache } from "react";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, parte, registro } from "@/db/schema";
import type { EtapaCaixa, EtapaItem } from "@/lib/etapas";
import { obterCaixasRecentes, somarNaoPago } from "@/lib/joiner";

// === Seção: Tipos ===
export type CaixaAberta = { id: number; nome: string };

export type DetalheCaixa = {
  id: number;
  nome: string;
  origem: string | null;
  situacao: EtapaCaixa;
};

// Pessoa com parte num item (nunca leva valores)
export type PessoaItem = { userId: string; nome: string; user: string; versoes: string[] };

export type MinhaParte = {
  id: number;
  membro: string | null;
  venda: number | null;
  inter: number | null;
  taxa: number | null;
  vendaPago: boolean;
  interPago: boolean;
  taxaPago: boolean;
};

export type ItemCaixa = {
  id: number;
  nome: string;
  grupo: string | null;
  qtdPc: number;
  situacao: EtapaItem;
  situacaoAtualizadaEm: Date;
  fotoId: string | null;
  proofWhId: string | null;
  // Outras pessoas com parte no item (o joiner atual fica em "minhasPartes")
  outrasPessoas: PessoaItem[];
  minhasPartes: MinhaParte[];
  totalPessoas: number;
  dono: PessoaItem | null;
  faltaPagar: number;
};

// === Seção: Caixa que abre em /caixas ===
// A mais recente em que o joiner tem itens; se não tiver nenhuma, a caixa aberta mais recente.
export async function obterCaixaPadrao(userId: string) {
  const [recente] = await obterCaixasRecentes(userId, 1);
  if (recente) return recente.id;

  const [aberta] = await db
    .select({ id: caixa.id })
    .from(caixa)
    .where(ne(caixa.situacao, "casa_gom"))
    .orderBy(desc(caixa.criadaEm))
    .limit(1);
  return aberta?.id ?? null;
}

// === Seção: Caixa e lista de caixas abertas ===
// "cache": o título da aba e a página dividem a mesma consulta
export const obterCaixa = cache(async (id: number): Promise<DetalheCaixa | null> => {
  if (!Number.isInteger(id)) return null;
  const [encontrada] = await db
    .select({ id: caixa.id, nome: caixa.nome, origem: caixa.origem, situacao: caixa.situacao })
    .from(caixa)
    .where(eq(caixa.id, id));
  return encontrada ?? null;
});

// Caixas que ainda não chegaram na casa da GOM (a caixa aberta na tela aparece sempre)
export async function obterCaixasAbertas(idAtual: number): Promise<CaixaAberta[]> {
  return db
    .select({ id: caixa.id, nome: caixa.nome })
    .from(caixa)
    .where(or(ne(caixa.situacao, "casa_gom"), eq(caixa.id, idAtual)))
    .orderBy(asc(caixa.id));
}

// === Seção: Itens da caixa ===
export async function obterItensCaixa(caixaId: number, userId: string): Promise<ItemCaixa[]> {
  const registros = await db
    .select({
      id: registro.id,
      nome: registro.nome,
      grupo: registro.grupo,
      qtdPc: registro.qtdPc,
      situacao: registro.situacao,
      situacaoAtualizadaEm: registro.situacaoAtualizadaEm,
      fotoId: registro.fotoId,
      proofWhId: registro.proofWhId,
    })
    .from(registro)
    .where(eq(registro.caixaId, caixaId))
    .orderBy(asc(registro.id));

  if (registros.length === 0) return [];
  const idsRegistros = registros.map((r) => r.id);

  // Quem tem parte em cada item, sem nenhum valor
  const pessoas = await db
    .select({
      registroId: parte.registroId,
      userId: parte.userId,
      membro: parte.membro,
      nome: user.name,
      user: user.username,
    })
    .from(parte)
    .innerJoin(user, eq(parte.userId, user.id))
    .where(inArray(parte.registroId, idsRegistros))
    .orderBy(asc(parte.id));

  // Valores e pagamentos: só das partes do próprio joiner
  const minhas = await db
    .select({
      id: parte.id,
      registroId: parte.registroId,
      membro: parte.membro,
      venda: parte.venda,
      inter: parte.inter,
      taxa: parte.taxa,
      vendaPago: parte.vendaPago,
      interPago: parte.interPago,
      taxaPago: parte.taxaPago,
    })
    .from(parte)
    .where(and(eq(parte.userId, userId), inArray(parte.registroId, idsRegistros)))
    .orderBy(asc(parte.id));

  return registros.map((r) => {
    const porPessoa = new Map<string, PessoaItem>();
    for (const p of pessoas.filter((p) => p.registroId === r.id)) {
      const pessoa = porPessoa.get(p.userId) ?? { userId: p.userId, nome: p.nome, user: p.user ?? "", versoes: [] };
      if (p.membro) pessoa.versoes.push(p.membro);
      porPessoa.set(p.userId, pessoa);
    }
    const todasPessoas = [...porPessoa.values()];

    const minhasPartes = minhas
      .filter((p) => p.registroId === r.id)
      .map((p) => ({
        id: p.id,
        membro: p.membro,
        venda: paraNumero(p.venda),
        inter: paraNumero(p.inter),
        taxa: paraNumero(p.taxa),
        vendaPago: p.vendaPago,
        interPago: p.interPago,
        taxaPago: p.taxaPago,
      }));

    return {
      ...r,
      outrasPessoas: todasPessoas.filter((p) => p.userId !== userId),
      minhasPartes,
      totalPessoas: todasPessoas.length,
      dono: todasPessoas[0] ?? null,
      faltaPagar: minhasPartes.reduce((total, p) => total + somarNaoPago(p), 0),
    };
  });
}

function paraNumero(valor: string | null) {
  return valor === null ? null : Number(valor);
}
