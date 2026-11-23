import { and, count, desc, eq } from "drizzle-orm";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, notificacao, parte, registro, type tipoNotificacao } from "@/db/schema";
import { obterEtapaCaixa, type EtapaCaixa } from "@/lib/etapas";
import { formatarMomento } from "@/lib/formatacao";

// === Seção: Tipos ===
export type TipoNotificacao = (typeof tipoNotificacao.enumValues)[number];

export type NovaNotificacao = {
  userId: string;
  tipo: TipoNotificacao;
  texto: string;
  link?: string;
};

export type Notificacao = {
  id: number;
  tipo: TipoNotificacao;
  texto: string;
  link: string | null;
  lida: boolean;
  quando: string;
};

export type CaixaDeEntrada = { itens: Notificacao[]; naoLidas: number };

const LIMITE_LISTA = 12;

// === Seção: Criar notificações ===
// Para entrar no mesmo db.batch da ação (a lista não pode estar vazia)
export function inserirNotificacoes(lista: NovaNotificacao[]) {
  return db.insert(notificacao).values(lista);
}

export async function notificar(lista: NovaNotificacao[]) {
  if (lista.length > 0) await inserirNotificacoes(lista);
}

// Contas da GOM (papel "admin")
export async function obterIdsDaGom() {
  const linhas = await db.select({ id: user.id }).from(user).where(eq(user.role, "admin"));
  return linhas.map((linha) => linha.id);
}

// === Seção: Ler as notificações de quem está logado ===
export async function obterNotificacoes(userId: string): Promise<CaixaDeEntrada> {
  const [linhas, [contagem]] = await Promise.all([
    db
      .select({
        id: notificacao.id,
        tipo: notificacao.tipo,
        texto: notificacao.texto,
        link: notificacao.link,
        lida: notificacao.lida,
        criadaEm: notificacao.criadaEm,
      })
      .from(notificacao)
      .where(eq(notificacao.userId, userId))
      .orderBy(desc(notificacao.criadaEm), desc(notificacao.id))
      .limit(LIMITE_LISTA),
    db
      .select({ total: count() })
      .from(notificacao)
      .where(and(eq(notificacao.userId, userId), eq(notificacao.lida, false))),
  ]);

  return {
    itens: linhas.map(({ criadaEm, ...resto }) => ({ ...resto, quando: formatarMomento(criadaEm) })),
    naoLidas: contagem?.total ?? 0,
  };
}

// === Seção: Avisos de caixa (para as telas da GOM que mudam etapa e valores) ===
async function obterCaixaEJoiners(caixaId: number) {
  const [dados] = await db.select({ nome: caixa.nome }).from(caixa).where(eq(caixa.id, caixaId));
  if (!dados) return null;
  const joiners = await db
    .selectDistinct({ userId: parte.userId })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .where(eq(registro.caixaId, caixaId));
  return { nome: dados.nome, userIds: joiners.map((joiner) => joiner.userId) };
}

// A caixa mudou de etapa: avisa todo mundo que tem item nela
export async function notificarEtapaCaixa(caixaId: number, etapa: EtapaCaixa) {
  const dados = await obterCaixaEJoiners(caixaId);
  if (!dados) return;
  const { rotulo } = obterEtapaCaixa(etapa);
  await notificar(
    dados.userIds.map((userId) => ({
      userId,
      tipo: "etapa_caixa",
      texto: `A caixa ${dados.nome} mudou de etapa: ${rotulo}.`,
      link: `/caixas/${caixaId}`,
    })),
  );
}

// A GOM lançou a taxa ou o frete (inter) da caixa; sem lista, avisa todos os joiners dela
export async function notificarValorLancado(caixaId: number, tipo: "taxa" | "frete", userIds?: string[]) {
  const dados = await obterCaixaEJoiners(caixaId);
  if (!dados) return;
  const valor = tipo === "taxa" ? "A taxa" : "O frete";
  await notificar(
    (userIds ?? dados.userIds).map((userId) => ({
      userId,
      tipo,
      texto: `${valor} da caixa ${dados.nome} chegou. O valor já está em Meus itens.`,
      link: "/meus-itens",
    })),
  );
}
