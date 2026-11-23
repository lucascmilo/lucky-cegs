"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { avisoCaixa, caixa, parte, proofGom, registro, situacaoCaixa } from "@/db/schema";
import { ORIGENS, TAMANHO_MAXIMO_AVISO } from "@/lib/configuracoes";
import type { EtapaCaixa } from "@/lib/etapas";
import { inserirNotificacoes } from "@/lib/notificacoes";
import { obterUsuarioAtual } from "@/lib/sessao";

type Resultado = { ok: true } | { ok: false; erro: string };

async function ehGom() {
  return (await obterUsuarioAtual())?.papel === "admin";
}

// === Seção: Caixas (nova, editar e excluir) ===
// O nome é sempre "Caixa <número> <origem>" e não pode repetir. A situação muda só pela faixa da caixa
// (onde os joiners recebem aviso), então editar não mexe nela.
type DadosCaixa = {
  numero: string;
  origem: string;
  situacao: EtapaCaixa;
  abertura: string;
  observacao: string;
};

type ResultadoCaixa = { ok: true; id: number } | { ok: false; erro?: string; erros: Record<string, string> };

const TAMANHO_MAXIMO_OBSERVACAO = 1000;

async function conferirCaixa(dados: DadosCaixa, idAtual?: number) {
  const erros: Record<string, string> = {};
  const numero = Number(dados.numero);
  if (!/^\d{1,4}$/.test(dados.numero.trim()) || numero < 1) erros.numero = "Use o número da caixa, como 7.";
  if (!(dados.origem in ORIGENS)) erros.origem = "Escolha a origem.";
  if (!situacaoCaixa.enumValues.includes(dados.situacao)) erros.situacao = "Escolha a situação.";
  const abertura = dados.abertura.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(abertura) || Number.isNaN(Date.parse(abertura))) erros.abertura = "Escolha a data de abertura.";

  const nome = `Caixa ${numero} ${dados.origem}`;
  if (!erros.numero && !erros.origem) {
    const [repetida] = await db
      .select({ id: caixa.id })
      .from(caixa)
      .where(and(sql`lower(${caixa.nome}) = ${nome.toLowerCase()}`, idAtual ? ne(caixa.id, idAtual) : undefined));
    if (repetida) erros.numero = `Já existe a ${nome}.`;
  }

  return { erros, nome, abertura, observacao: dados.observacao.trim().slice(0, TAMANHO_MAXIMO_OBSERVACAO) || null };
}

export async function criarCaixa(dados: DadosCaixa): Promise<ResultadoCaixa> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode criar caixas.", erros: {} };
  const { erros, nome, abertura, observacao } = await conferirCaixa(dados);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  const [nova] = await db
    .insert(caixa)
    .values({ nome, origem: dados.origem, situacao: dados.situacao, abertura, observacao })
    .returning({ id: caixa.id });
  refresh();
  return { ok: true, id: nova.id };
}

export async function editarCaixa(caixaId: number, dados: DadosCaixa): Promise<ResultadoCaixa> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode editar caixas.", erros: {} };
  if (!Number.isInteger(caixaId)) return { ok: false, erro: "Caixa inválida.", erros: {} };
  const { erros, nome, abertura, observacao } = await conferirCaixa(dados, caixaId);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  const [editada] = await db
    .update(caixa)
    .set({ nome, origem: dados.origem, abertura, observacao })
    .where(eq(caixa.id, caixaId))
    .returning({ id: caixa.id });
  if (!editada) return { ok: false, erro: "Essa caixa não existe mais.", erros: {} };

  // O título da aba guarda o nome em cache
  updateTag(`caixa-${caixaId}`);
  refresh();
  return { ok: true, id: caixaId };
}

// Só caixa vazia (sem itens e sem proofs) pode ser excluída
export async function excluirCaixa(caixaId: number): Promise<Resultado> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode excluir caixas." };
  if (!Number.isInteger(caixaId)) return { ok: false, erro: "Caixa inválida." };

  const [item] = await db.select({ id: registro.id }).from(registro).where(eq(registro.caixaId, caixaId)).limit(1);
  if (item) return { ok: false, erro: "A caixa ainda tem itens. Mova ou exclua os itens antes." };
  const [proof] = await db.select({ id: proofGom.id }).from(proofGom).where(eq(proofGom.caixaId, caixaId)).limit(1);
  if (proof) return { ok: false, erro: "A caixa tem proofs enviadas. Remova as proofs antes." };

  await db.delete(caixa).where(eq(caixa.id, caixaId));
  updateTag(`caixa-${caixaId}`);
  refresh();
  return { ok: true };
}

// === Seção: Aviso da GOM para os joiners de uma caixa ===
// Vai para o sino de todos os joiners da caixa ou de um só (pelo user)
export async function postarAviso(
  caixaId: number,
  mensagem: string,
  para: "todos" | string,
): Promise<{ ok: true; enviados: number } | { ok: false; erro: string }> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode postar avisos." };
  const texto = mensagem.trim().replace(/\s+/g, " ");
  if (texto.length < 3) return { ok: false, erro: "Escreva o aviso." };
  if (texto.length > TAMANHO_MAXIMO_AVISO) return { ok: false, erro: `Use no máximo ${TAMANHO_MAXIMO_AVISO} caracteres.` };

  const [dados] = Number.isInteger(caixaId)
    ? await db.select({ nome: caixa.nome }).from(caixa).where(eq(caixa.id, caixaId))
    : [];
  if (!dados) return { ok: false, erro: "Caixa não encontrada." };

  const joiners = await db
    .selectDistinct({ userId: parte.userId, user: user.username })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .innerJoin(user, eq(parte.userId, user.id))
    .where(eq(registro.caixaId, caixaId));
  const destino = para === "todos" ? joiners : joiners.filter((j) => j.user === para.replace(/^@/, "").toLowerCase());
  if (destino.length === 0) {
    return { ok: false, erro: para === "todos" ? "A caixa ainda não tem joiners." : "Esse joiner não tem itens nessa caixa." };
  }

  await db.batch([
    inserirNotificacoes(
      destino.map(({ userId }) => ({
        userId,
        tipo: "aviso",
        texto: `Aviso da ${dados.nome}: ${texto}`,
        link: `/caixas/${caixaId}`,
      })),
    ),
    db.insert(avisoCaixa).values({
      caixaId,
      texto,
      para: para === "todos" ? null : destino[0].user,
      enviados: destino.length,
    }),
  ]);
  refresh();
  return { ok: true, enviados: destino.length };
}
