import { and, asc, eq, ne, sql } from "drizzle-orm";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, parte, proofGom, registro } from "@/db/schema";
import { ETAPAS_CAIXA, taxaDefinida, type EtapaCaixa } from "@/lib/etapas";

// Tudo aqui é só para a GOM: quem chama precisa ter passado por exigirGom().

// === Seção: Quem falta pagar ===
// null = nada a pagar naquilo; "emBreve" = tem valor que a GOM ainda não lançou
export type ValorDevido = number | "emBreve" | null;

export type JoinerDevendo = {
  userId: string;
  nome: string;
  user: string;
  item: ValorDevido;
  inter: ValorDevido;
  taxa: ValorDevido;
  total: number;
};

type Soma = { valor: number; emBreve: boolean };

function somar(soma: Soma, valor: string | null, pago: boolean) {
  if (pago) return;
  if (valor === null) soma.emBreve = true;
  else soma.valor += Number(valor);
}

function valorDevido(soma: Soma): ValorDevido {
  if (soma.valor > 0) return soma.valor;
  return soma.emBreve ? "emBreve" : null;
}

// Soma de todas as caixas; da pessoa que mais deve para a que menos deve
export async function obterQuemFaltaPagar(): Promise<JoinerDevendo[]> {
  const partes = await db
    .select({
      userId: parte.userId,
      nome: user.name,
      user: user.username,
      venda: parte.venda,
      inter: parte.inter,
      taxa: parte.taxa,
      vendaPago: parte.vendaPago,
      interPago: parte.interPago,
      taxaPago: parte.taxaPago,
      situacaoCaixa: caixa.situacao,
    })
    .from(parte)
    .innerJoin(user, eq(parte.userId, user.id))
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .innerJoin(caixa, eq(registro.caixaId, caixa.id));

  const porPessoa = new Map<string, { nome: string; user: string; item: Soma; inter: Soma; taxa: Soma }>();
  for (const p of partes) {
    const pessoa = porPessoa.get(p.userId) ?? {
      nome: p.nome.toLowerCase(),
      user: p.user ?? "",
      item: { valor: 0, emBreve: false },
      inter: { valor: 0, emBreve: false },
      taxa: { valor: 0, emBreve: false },
    };
    somar(pessoa.item, p.venda, p.vendaPago);
    somar(pessoa.inter, p.inter, p.interPago);
    // A taxa só existe depois que a caixa chega ao Brasil
    somar(pessoa.taxa, taxaDefinida(p.situacaoCaixa) ? p.taxa : null, p.taxaPago);
    porPessoa.set(p.userId, pessoa);
  }

  return [...porPessoa.entries()]
    .map(([userId, p]) => ({
      userId,
      nome: p.nome,
      user: p.user,
      item: valorDevido(p.item),
      inter: valorDevido(p.inter),
      taxa: valorDevido(p.taxa),
      total: p.item.valor + p.inter.valor + p.taxa.valor,
    }))
    .filter((pessoa) => pessoa.total > 0)
    .sort((a, b) => b.total - a.total);
}

// === Seção: Caixas em andamento ===
// Todas que ainda não chegaram na casa da GOM; as mais adiantadas primeiro
export type CaixaAndamento = { id: number; nome: string; situacao: EtapaCaixa; totalItens: number };

export async function obterCaixasEmAndamento(): Promise<CaixaAndamento[]> {
  const caixas = await db
    .select({
      id: caixa.id,
      nome: caixa.nome,
      situacao: caixa.situacao,
      totalItens: sql<number>`coalesce(sum(${registro.qtdPc} + ${registro.qtdPostcard} + ${registro.qtdSmini} + ${registro.qtdAlbum} + ${registro.qtdItens}), 0)::int`,
    })
    .from(caixa)
    .leftJoin(registro, eq(registro.caixaId, caixa.id))
    .where(ne(caixa.situacao, "casa_gom"))
    .groupBy(caixa.id)
    .orderBy(asc(caixa.criadaEm));

  const ordem = (etapa: EtapaCaixa) => ETAPAS_CAIXA.findIndex((item) => item.id === etapa);
  return caixas.sort((a, b) => ordem(b.situacao) - ordem(a.situacao));
}

// === Seção: Proofs para subir ===
// Um joiner por caixa que chegou na casa da GOM e ainda não tem proof
export type ProofPendente = { caixaId: number; nomeCaixa: string; userId: string; user: string };

export async function obterProofsParaSubir(): Promise<ProofPendente[]> {
  const pendentes = await db
    .selectDistinct({
      caixaId: caixa.id,
      nomeCaixa: caixa.nome,
      userId: parte.userId,
      user: user.username,
      criadaEm: caixa.criadaEm,
    })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .innerJoin(caixa, eq(registro.caixaId, caixa.id))
    .innerJoin(user, eq(parte.userId, user.id))
    .leftJoin(proofGom, and(eq(proofGom.caixaId, caixa.id), eq(proofGom.userId, parte.userId)))
    .where(and(eq(caixa.situacao, "casa_gom"), sql`${proofGom.id} is null`))
    .orderBy(asc(caixa.criadaEm), asc(user.username));

  return pendentes.map(({ caixaId, nomeCaixa, userId, user }) => ({ caixaId, nomeCaixa, userId, user: user ?? "" }));
}
