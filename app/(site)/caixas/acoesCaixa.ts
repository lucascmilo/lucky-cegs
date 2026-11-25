"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { refresh, updateTag } from "next/cache";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { avisoCaixa, caixa, parte, proofGom, registro, situacaoCaixa } from "@/db/schema";
import { ORIGENS, TAMANHO_MAXIMO_AVISO } from "@/lib/configuracoes";
import type { EtapaCaixa } from "@/lib/etapas";
import { inserirNotificacoes } from "@/lib/notificacoes";
import { lerNumero } from "@/lib/planilhaCaixa";
import { obterUsuarioAtual } from "@/lib/sessao";

type Resultado = { ok: true } | { ok: false; erro: string };
export type ResultadoLote = { ok: true; atualizadas: number } | { ok: false; erro: string };

const CATEGORIAS_EM_LOTE = ["photocards", "postcards", "smini", "itens"] as const;
export type CategoriaEmLote = (typeof CATEGORIAS_EM_LOTE)[number];

type LinhaQuantidadesParte = {
  qtdPc: number;
  qtdPostcard: number;
  qtdSmini: number;
  qtdItens: number;
};

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

type ResultadoCaixa =
  | { ok: true; id: number }
  | { ok: false; erro?: string; erros: Record<string, string> };

const TAMANHO_MAXIMO_OBSERVACAO = 1000;

function limparUsername(texto: string) {
  return texto.trim().replace(/^@/, "").toLowerCase();
}

function lerQuantidadeCategoria(linha: LinhaQuantidadesParte, categoria: CategoriaEmLote): number {
  const mapa: Record<CategoriaEmLote, number> = {
    photocards: linha.qtdPc,
    postcards: linha.qtdPostcard,
    smini: linha.qtdSmini,
    itens: linha.qtdItens,
  };
  const valor = mapa[categoria];
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0 ? valor : 0;
}

function paraCentavos(valor: number): number {
  return Math.round(valor * 100);
}

function deCentavos(centavos: number): string {
  return (centavos / 100).toFixed(2);
}

async function conferirCaixa(dados: DadosCaixa, idAtual?: number) {
  const erros: Record<string, string> = {};
  const numeroLimpo = dados.numero.trim();
  const numero = Number(numeroLimpo);
  if (!/^\d{1,4}$/.test(numeroLimpo) || numero < 1) {
    erros.numero = "Use o número da caixa, como 7.";
  }
  if (!(dados.origem in ORIGENS)) erros.origem = "Escolha a origem.";
  if (!situacaoCaixa.enumValues.includes(dados.situacao)) erros.situacao = "Escolha a situação.";
  const abertura = dados.abertura.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(abertura) || Number.isNaN(Date.parse(abertura))) {
    erros.abertura = "Escolha a data de abertura.";
  }

  const nome = `Caixa ${numero} ${dados.origem}`;
  if (!erros.numero && !erros.origem) {
    const [repetida] = await db
      .select({ id: caixa.id })
      .from(caixa)
      .where(
        and(
          sql`lower(${caixa.nome}) = ${nome.toLowerCase()}`,
          idAtual ? ne(caixa.id, idAtual) : undefined,
        ),
      );
    if (repetida) erros.numero = `Já existe a ${nome}.`;
  }

  return {
    erros,
    nome,
    abertura,
    observacao: dados.observacao.trim().slice(0, TAMANHO_MAXIMO_OBSERVACAO) || null,
  };
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

  const [item] = await db
    .select({ id: registro.id })
    .from(registro)
    .where(eq(registro.caixaId, caixaId))
    .limit(1);
  if (item) {
    return { ok: false, erro: "A caixa ainda tem itens. Mova ou exclua os itens antes." };
  }
  const [proof] = await db
    .select({ id: proofGom.id })
    .from(proofGom)
    .where(eq(proofGom.caixaId, caixaId))
    .limit(1);
  if (proof) {
    return { ok: false, erro: "A caixa tem proofs enviadas. Remova as proofs antes." };
  }

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
  if (texto.length > TAMANHO_MAXIMO_AVISO) {
    return { ok: false, erro: `Use no máximo ${TAMANHO_MAXIMO_AVISO} caracteres.` };
  }

  const [dados] = Number.isInteger(caixaId)
    ? await db.select({ nome: caixa.nome }).from(caixa).where(eq(caixa.id, caixaId))
    : [];
  if (!dados) return { ok: false, erro: "Caixa não encontrada." };

  const alvo = para === "todos" ? "todos" : limparUsername(para);
  const joiners = await db
    .selectDistinct({ userId: parte.userId, user: user.username })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .innerJoin(user, eq(parte.userId, user.id))
    .where(eq(registro.caixaId, caixaId));
  const destino = alvo === "todos" ? joiners : joiners.filter((j) => j.user === alvo);
  if (destino.length === 0) {
    return {
      ok: false,
      erro:
        alvo === "todos"
          ? "A caixa ainda não tem joiners."
          : "Esse joiner não tem itens nessa caixa.",
    };
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
      para: alvo === "todos" ? null : destino[0].user,
      enviados: destino.length,
    }),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  refresh();
  return { ok: true, enviados: destino.length };
}

// === Seção: Lançar inter e/ou taxa unitária de uma categoria (exceto álbuns) numa caixa ===
// Multiplica a quantidade da categoria de cada parte pelo valor unitário informado (ex.: 6 PCs × R$ 1,50 = R$ 9,00)
export async function aplicarInterTaxaCategoria(
  caixaId: number,
  categoria: CategoriaEmLote,
  entrada: { inter?: string; taxa?: string },
): Promise<ResultadoLote> {
  if (!(await ehGom())) {
    return { ok: false, erro: "Só a GOM pode lançar inter ou taxa em lote." };
  }
  if (!Number.isInteger(caixaId) || caixaId < 1) {
    return { ok: false, erro: "Caixa inválida." };
  }
  if (!CATEGORIAS_EM_LOTE.includes(categoria)) {
    return {
      ok: false,
      erro: "Álbuns devem ser lançados manualmente; escolha photocards, postcards, smini ou itens.",
    };
  }

  const interTexto = (entrada.inter ?? "").trim();
  const taxaTexto = (entrada.taxa ?? "").trim();
  if (!interTexto && !taxaTexto) {
    return { ok: false, erro: "Informe um valor unitário de inter, de taxa ou ambos." };
  }

  const valorUnitarioInter = interTexto ? lerNumero(interTexto) : null;
  const valorUnitarioTaxa = taxaTexto ? lerNumero(taxaTexto) : null;

  if (
    interTexto &&
    (valorUnitarioInter === null || Number.isNaN(valorUnitarioInter) || valorUnitarioInter < 0)
  ) {
    return { ok: false, erro: "Valor de inter inválido." };
  }
  if (
    taxaTexto &&
    (valorUnitarioTaxa === null || Number.isNaN(valorUnitarioTaxa) || valorUnitarioTaxa < 0)
  ) {
    return { ok: false, erro: "Valor de taxa inválido." };
  }

  const [dadosCaixa] = await db
    .select({ id: caixa.id })
    .from(caixa)
    .where(eq(caixa.id, caixaId));
  if (!dadosCaixa) return { ok: false, erro: "Caixa não encontrada." };

  const partesDaCaixa = await db
    .select({
      parteId: parte.id,
      qtdPc: parte.qtdPc,
      qtdPostcard: parte.qtdPostcard,
      qtdSmini: parte.qtdSmini,
      qtdItens: parte.qtdItens,
    })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .where(and(eq(registro.caixaId, caixaId), eq(registro.semDono, false)));

  const alvos = partesDaCaixa
    .map((item) => ({
      parteId: item.parteId,
      qtdCategoria: lerQuantidadeCategoria(item, categoria),
    }))
    .filter((item) => item.qtdCategoria > 0);

  if (alvos.length === 0) {
    return { ok: false, erro: "Não há itens com dono nessa categoria nesta caixa." };
  }

  const interCentavosUnitario =
    valorUnitarioInter !== null ? paraCentavos(valorUnitarioInter) : null;
  const taxaCentavosUnitario =
    valorUnitarioTaxa !== null ? paraCentavos(valorUnitarioTaxa) : null;

  const operacoes: BatchItem<"pg">[] = alvos.map((alvo) => {
    const mudancas: {
      inter?: string;
      interPago?: boolean;
      taxa?: string;
      taxaPago?: boolean;
    } = {};

    if (interCentavosUnitario !== null) {
      mudancas.inter = deCentavos(interCentavosUnitario * alvo.qtdCategoria);
      mudancas.interPago = false;
    }

    if (taxaCentavosUnitario !== null) {
      mudancas.taxa = deCentavos(taxaCentavosUnitario * alvo.qtdCategoria);
      mudancas.taxaPago = false;
    }

    return db.update(parte).set(mudancas).where(eq(parte.id, alvo.parteId));
  });

  if (operacoes.length > 0) {
    await db.batch(operacoes as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  }

  refresh();
  return { ok: true, atualizadas: alvos.length };
}

// === Seção: Marcar como pago o frete inter e/ou taxa de um joiner numa caixa ===
export async function marcarFreteTaxaPagoJoiner(
  caixaId: number,
  joinerUserId: string,
  opcoes: { inter?: boolean; taxa?: boolean },
): Promise<ResultadoLote> {
  if (!(await ehGom())) {
    return { ok: false, erro: "Só a GOM pode marcar pagamentos." };
  }
  if (!Number.isInteger(caixaId) || caixaId < 1 || !joinerUserId.trim()) {
    return { ok: false, erro: "Caixa ou joiner inválido." };
  }

  const marcarInter = Boolean(opcoes.inter);
  const marcarTaxa = Boolean(opcoes.taxa);
  if (!marcarInter && !marcarTaxa) {
    return { ok: false, erro: "Escolha inter, taxa ou ambos para marcar como pago." };
  }

  const [dadosCaixa] = await db
    .select({ id: caixa.id, nome: caixa.nome })
    .from(caixa)
    .where(eq(caixa.id, caixaId));
  if (!dadosCaixa) return { ok: false, erro: "Caixa não encontrada." };

  const partesAlvo = await db
    .select({
      parteId: parte.id,
      inter: parte.inter,
      taxa: parte.taxa,
    })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .where(and(eq(registro.caixaId, caixaId), eq(parte.userId, joinerUserId)));

  if (partesAlvo.length === 0) {
    return { ok: false, erro: "Esse joiner não possui itens nesta caixa." };
  }

  const idsParaAtualizar: number[] = [];
  for (const p of partesAlvo) {
    const temInterLancado = marcarInter && p.inter !== null;
    const temTaxaLancada = marcarTaxa && p.taxa !== null;
    if (temInterLancado || temTaxaLancada) {
      idsParaAtualizar.push(p.parteId);
    }
  }

  if (idsParaAtualizar.length === 0) {
    return {
      ok: false,
      erro: "Não há valores de inter ou taxa lançados para marcar como pagos.",
    };
  }

  const setPagamento: { interPago?: boolean; taxaPago?: boolean } = {};
  if (marcarInter) setPagamento.interPago = true;
  if (marcarTaxa) setPagamento.taxaPago = true;

  const notificacoes: Parameters<typeof inserirNotificacoes>[0] = [];
  if (marcarInter) {
    notificacoes.push({
      userId: joinerUserId,
      tipo: "frete",
      texto: `A GOM marcou o seu frete inter da ${dadosCaixa.nome} como pago.`,
      link: `/caixas/${caixaId}`,
    });
  }
  if (marcarTaxa) {
    notificacoes.push({
      userId: joinerUserId,
      tipo: "taxa",
      texto: `A GOM marcou a sua taxa da ${dadosCaixa.nome} como paga.`,
      link: `/caixas/${caixaId}`,
    });
  }

  await db.batch([
    db
      .update(parte)
      .set(setPagamento)
      .where(and(inArray(parte.id, idsParaAtualizar), eq(parte.userId, joinerUserId))),
    ...(notificacoes.length > 0 ? [inserirNotificacoes(notificacoes)] : []),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

  refresh();
  return { ok: true, atualizadas: idsParaAtualizar.length };
}