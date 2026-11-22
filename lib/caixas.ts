import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, historicoEtapa, parte, registro } from "@/db/schema";
import { etapaItemNaCaixa, taxaDefinida, type EtapaCaixa, type EtapaItem } from "@/lib/etapas";
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
  qtdPostcard: number;
  qtdAlbum: number;
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
  // Datas de cada etapa (só nos itens do próprio joiner)
  historico: { situacao: EtapaItem; data: Date }[];
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
      qtdPostcard: registro.qtdPostcard,
      qtdAlbum: registro.qtdAlbum,
      situacao: registro.situacao,
      situacaoAtualizadaEm: registro.situacaoAtualizadaEm,
      fotoId: registro.fotoId,
      proofWhId: registro.proofWhId,
    })
    .from(registro)
    .where(eq(registro.caixaId, caixaId))
    .orderBy(asc(registro.id));

  if (registros.length === 0) return [];

  // Antes da caixa chegar ao Brasil a taxa ainda não existe: fica "a definir"
  const [daCaixa] = await db.select({ situacao: caixa.situacao }).from(caixa).where(eq(caixa.id, caixaId));
  const comTaxa = daCaixa ? taxaDefinida(daCaixa.situacao) : false;

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

  // Datas das etapas, só dos itens em que o joiner tem parte
  const idsMeus = [...new Set(minhas.map((p) => p.registroId))];
  const historicos = idsMeus.length
    ? await db
        .select({ registroId: historicoEtapa.registroId, situacao: historicoEtapa.situacao, data: historicoEtapa.data })
        .from(historicoEtapa)
        .where(inArray(historicoEtapa.registroId, idsMeus))
        .orderBy(asc(historicoEtapa.data))
    : [];

  return registros.map((r) => {
    const porPessoa = new Map<string, PessoaItem>();
    for (const p of pessoas.filter((p) => p.registroId === r.id)) {
      const pessoa = porPessoa.get(p.userId) ?? { userId: p.userId, nome: p.nome.toLowerCase(), user: p.user ?? "", versoes: [] };
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
        taxa: comTaxa ? paraNumero(p.taxa) : null,
        vendaPago: p.vendaPago,
        interPago: p.interPago,
        taxaPago: comTaxa && p.taxaPago,
      }));

    return {
      ...r,
      // O item acompanha a etapa da caixa depois que ela sai da warehouse
      situacao: daCaixa ? etapaItemNaCaixa(r.situacao, daCaixa.situacao) : r.situacao,
      outrasPessoas: todasPessoas.filter((p) => p.userId !== userId),
      minhasPartes,
      totalPessoas: todasPessoas.length,
      dono: todasPessoas[0] ?? null,
      faltaPagar: minhasPartes.reduce((total, p) => total + somarNaoPago(p), 0),
      historico: historicos
        .filter((h) => h.registroId === r.id)
        .map((h) => ({ situacao: h.situacao, data: h.data })),
    };
  });
}

function paraNumero(valor: string | null) {
  return valor === null ? null : Number(valor);
}

// === Seção: Nome da caixa para o título da aba ===
// Em cache (o título não espera o banco a cada navegação). A etiqueta permite atualizar quando a GOM renomear.
export async function obterNomeCaixa(id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(`caixa-${id}`);
  if (!Number.isInteger(id)) return null;
  const [encontrada] = await db.select({ nome: caixa.nome }).from(caixa).where(eq(caixa.id, id));
  return encontrada?.nome ?? null;
}
