"use server";

import { and, eq, inArray, ne, or } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { refresh, updateTag } from "next/cache";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { caixa, claim, historicoEtapa, parte, registro, situacao as enumSituacao, situacaoCaixa } from "@/db/schema";
import { cloudinary } from "@/lib/cloudinaryServidor";
import { type EtapaCaixa, type EtapaItem, etapaItemNaCaixa } from "@/lib/etapas";
import { formatarReais } from "@/lib/formatacao";
import { type NovaNotificacao, inserirNotificacoes, notificarEtapaCaixa } from "@/lib/notificacoes";
import { CATEGORIAS, type Quantidades, lerNumero } from "@/lib/planilhaCaixa";
import { obterUsuarioAtual } from "@/lib/sessao";

type Resultado = { ok: true } | { ok: false; erro: string };

const PASTAS_FOTOS = ["itens/", "warehouse/"];
const TAMANHO_MAXIMO_TEXTO = 120;

async function ehGom() {
  return (await obterUsuarioAtual())?.papel === "admin";
}

// === Seção: Dados que a janela de item manda ===
export type DadosParte = {
  // Parte que já existe (na edição); vazio = parte nova
  id?: number;
  user: string;
  membro: string;
  valor: string;
  inter: string;
  taxa: string;
  vendaPago: boolean;
  interPago: boolean;
  taxaPago: boolean;
  quantidades: Quantidades;
};

type DadosItem = {
  caixaId: number;
  grupo: string;
  situacao: EtapaItem;
  nome: string;
  fotoId: string | null;
  proofWhId: string | null;
  quantidades: Quantidades;
  peso: string;
  compra: string;
  tipo: "individual" | "set";
  partes: DadosParte[];
};

// Erros por campo ("nome", "partes.0.user"…) para a janela mostrar cada um no lugar certo
type ResultadoItem = { ok: true } | { ok: false; erro?: string; erros: Record<string, string> };

function quantidadeValida(valor: number) {
  return Number.isInteger(valor) && valor >= 0 && valor <= 999;
}

function textoLimpo(texto: string) {
  return texto.trim().slice(0, TAMANHO_MAXIMO_TEXTO);
}

function paraTexto(valor: number | null) {
  return valor === null ? null : String(valor);
}

function limparUsername(texto: string) {
  return texto.trim().replace(/^@/, "").toLowerCase();
}

// === Seção: Conferência comum a "Novo item" e "Editar item" ===
// Sem joiner, o item individual vira "sem dono" com valor + inter + taxa como preço.
// Joiner sem conta no site não entra: a conta precisa existir antes.
// Pago só vale para valor já lançado.
async function conferirItem(dados: DadosItem) {
  const erros: Record<string, string> = {};
  const nome = textoLimpo(dados.nome);
  if (!nome) erros.nome = "Escreva o nome do item ou do set.";

  const [destino] = Number.isInteger(dados.caixaId)
    ? await db.select({ situacao: caixa.situacao, nome: caixa.nome }).from(caixa).where(eq(caixa.id, dados.caixaId))
    : [];
  if (!destino) erros.caixaId = "Escolha uma caixa.";

  if (!enumSituacao.enumValues.includes(dados.situacao)) erros.situacao = "Escolha a situação.";
  if (CATEGORIAS.some(({ id }) => !quantidadeValida(dados.quantidades[id]))) erros.quantidades = "Use números inteiros.";

  const peso = lerNumero(dados.peso);
  if (Number.isNaN(peso)) erros.peso = "Use só números, como 0,250.";
  const compra = lerNumero(dados.compra);
  if (Number.isNaN(compra)) erros.compra = "Use só números, como 45,90.";

  for (const id of [dados.fotoId, dados.proofWhId]) {
    if (id && !PASTAS_FOTOS.some((pasta) => id.startsWith(pasta))) erros.fotos = "Foto inválida. Envie de novo.";
  }

  const set = dados.tipo === "set";
  if (set && dados.partes.length < 2) erros.partes = "Um set precisa de pelo menos 2 joiners.";

  const users = dados.partes.map((p) => limparUsername(p.user)).filter(Boolean);
  const contas = users.length
    ? await db.select({ id: user.id, user: user.username }).from(user).where(inArray(user.username, users))
    : [];

  const partes = (set ? dados.partes : dados.partes.slice(0, 1)).map((p, indice) => {
    const chave = `partes.${indice}`;
    const username = limparUsername(p.user);
    const conta = contas.find((c) => c.user === username);
    if (!username && set) erros[`${chave}.user`] = "Escolha o joiner.";
    if (username && !conta) erros[`${chave}.user`] = "Nenhuma conta com esse user.";

    const venda = lerNumero(p.valor);
    const inter = lerNumero(p.inter);
    const taxa = lerNumero(p.taxa);
    if (Number.isNaN(venda)) erros[`${chave}.valor`] = "Use só números, como 45,90.";
    if (Number.isNaN(inter)) erros[`${chave}.inter`] = "Use só números.";
    if (Number.isNaN(taxa)) erros[`${chave}.taxa`] = "Use só números.";
    if (set && CATEGORIAS.some(({ id }) => !quantidadeValida(p.quantidades[id]))) {
      erros[`${chave}.quantidades`] = "Use números inteiros.";
    }

    return {
      id: Number.isInteger(p.id) ? p.id : undefined,
      userId: conta?.id ?? null,
      membro: textoLimpo(p.membro) || null,
      venda,
      inter,
      taxa,
      vendaPago: venda !== null && Boolean(p.vendaPago),
      interPago: inter !== null && Boolean(p.interPago),
      taxaPago: taxa !== null && Boolean(p.taxaPago),
      // No item individual a pessoa fica com tudo
      quantidades: set ? p.quantidades : dados.quantidades,
    };
  });

  const semDono = !set && !partes[0]?.userId;
  const parte0 = partes[0];

  return {
    erros,
    destino,
    partes,
    semDono,
    valores: {
      caixaId: dados.caixaId,
      tipo: dados.tipo,
      situacao: destino ? etapaItemNaCaixa(dados.situacao, destino.situacao) : dados.situacao,
      nome,
      grupo: textoLimpo(dados.grupo) || null,
      membro: semDono ? (parte0?.membro ?? null) : null,
      pesoKg: paraTexto(peso),
      qtdPc: dados.quantidades.pc,
      qtdPostcard: dados.quantidades.postcard,
      qtdSmini: dados.quantidades.smini,
      qtdAlbum: dados.quantidades.album,
      qtdItens: dados.quantidades.itens,
      compra: paraTexto(compra),
      fotoId: dados.fotoId,
      proofWhId: dados.proofWhId,
      semDono,
      precoSemDono: semDono && parte0 ? String((parte0.venda ?? 0) + (parte0.inter ?? 0) + (parte0.taxa ?? 0)) : null,
    },
  };
}

type ParteConferida = Awaited<ReturnType<typeof conferirItem>>["partes"][number];

function valoresDaParte(p: ParteConferida) {
  return {
    membro: p.membro,
    venda: paraTexto(p.venda),
    inter: paraTexto(p.inter),
    taxa: paraTexto(p.taxa),
    vendaPago: p.vendaPago,
    interPago: p.interPago,
    taxaPago: p.taxaPago,
    qtdPc: p.quantidades.pc,
    qtdPostcard: p.quantidades.postcard,
    qtdSmini: p.quantidades.smini,
    qtdAlbum: p.quantidades.album,
    qtdItens: p.quantidades.itens,
  };
}

// === Seção: Novo item ===
export async function criarItem(dados: DadosItem): Promise<ResultadoItem> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode adicionar itens.", erros: {} };

  const { erros, destino, partes, semDono, valores } = await conferirItem(dados);
  if (Object.keys(erros).length > 0 || !destino) return { ok: false, erros };

  const [novo] = await db.insert(registro).values(valores).returning({ id: registro.id });

  try {
    const historico = db.insert(historicoEtapa).values({ registroId: novo.id, situacao: valores.situacao });
    if (semDono) {
      await historico;
    } else {
      await db.batch([
        historico,
        db.insert(parte).values(partes.map((p) => ({ registroId: novo.id, userId: p.userId!, ...valoresDaParte(p) }))),
      ]);
    }
  } catch {
    // Sem as partes o item ficaria pela metade: desfaz
    await db.delete(registro).where(eq(registro.id, novo.id));
    return { ok: false, erro: "Não deu para salvar. Tente de novo.", erros: {} };
  }

  refresh();
  return { ok: true };
}

// === Seção: Editar item ===
// Mudar a caixa aqui é o mesmo que "Mover". Joiner tirado do item recebe aviso; frete (inter) e taxa
// lançados agora (antes vazios) também avisam o joiner.
export async function editarItem(registroId: number, dados: DadosItem): Promise<ResultadoItem> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode editar itens.", erros: {} };

  const [antes] = Number.isInteger(registroId)
    ? await db
        .select({
          situacao: registro.situacao,
          semDono: registro.semDono,
          fotoId: registro.fotoId,
          proofWhId: registro.proofWhId,
        })
        .from(registro)
        .where(eq(registro.id, registroId))
    : [];
  if (!antes) return { ok: false, erro: "Esse item não existe mais.", erros: {} };

  const { erros, destino, partes, semDono, valores } = await conferirItem(dados);
  if (Object.keys(erros).length > 0 || !destino) return { ok: false, erros };

  const existentes = await db
    .select({ id: parte.id, userId: parte.userId, inter: parte.inter, taxa: parte.taxa })
    .from(parte)
    .where(eq(parte.registroId, registroId));

  const mantidas = semDono ? [] : partes.filter((p) => p.id && existentes.some((e) => e.id === p.id));
  const novas = semDono ? [] : partes.filter((p) => !p.id || !existentes.some((e) => e.id === p.id));
  const removidas = existentes.filter((e) => !mantidas.some((p) => p.id === e.id));

  const agora = new Date();
  const mudouEtapa = valores.situacao !== antes.situacao;
  const consultas: BatchItem<"pg">[] = [
    db
      .update(registro)
      .set({ ...valores, atualizadoEm: agora, ...(mudouEtapa ? { situacaoAtualizadaEm: agora } : {}) })
      .where(eq(registro.id, registroId)),
    // Linha que trocou de joiner não leva junto o que a pessoa anterior já tinha pago
    ...mantidas.map((p) => {
      const trocouDePessoa = existentes.find((e) => e.id === p.id)?.userId !== p.userId;
      const pagamentos = trocouDePessoa ? { vendaPago: false, interPago: false, taxaPago: false } : {};
      return db
        .update(parte)
        .set({ userId: p.userId!, ...valoresDaParte(p), ...pagamentos })
        .where(eq(parte.id, p.id!));
    }),
  ];
  if (novas.length > 0) {
    consultas.push(db.insert(parte).values(novas.map((p) => ({ registroId, userId: p.userId!, ...valoresDaParte(p) }))));
  }
  if (removidas.length > 0) {
    consultas.push(
      db.delete(parte).where(
        inArray(
          parte.id,
          removidas.map((r) => r.id),
        ),
      ),
    );
  }
  if (mudouEtapa) consultas.push(db.insert(historicoEtapa).values({ registroId, situacao: valores.situacao, data: agora }));
  // Item que tinha dono e voltou a ser sem dono não carrega pedidos antigos; o contrário recusa os pedidos esperando
  if (antes.semDono && !semDono) {
    consultas.push(
      db
        .update(claim)
        .set({ status: "recusado" })
        .where(and(eq(claim.registroId, registroId), eq(claim.status, "pedido"))),
    );
  }

  // === Avisos aos joiners ===
  const ficam = new Set([...mantidas, ...novas].map((p) => p.userId));
  const avisos: NovaNotificacao[] = [];
  // Quem tinha parte e não tem mais (linha apagada ou trocada por outro joiner)
  for (const userId of new Set(existentes.map((e) => e.userId))) {
    if (ficam.has(userId)) continue;
    avisos.push({
      userId,
      tipo: "item",
      texto: `Você não está mais no item ${valores.nome} (${destino.nome}).`,
      link: "/meus-itens",
    });
  }
  for (const p of mantidas) {
    const anterior = existentes.find((e) => e.id === p.id);
    if (anterior?.inter === null && p.inter !== null) {
      avisos.push({
        userId: p.userId!,
        tipo: "frete",
        texto: `O frete de ${valores.nome} chegou: ${formatarReais(p.inter)}. O valor já está em Meus itens.`,
        link: "/meus-itens",
      });
    }
    if (anterior?.taxa === null && p.taxa !== null) {
      avisos.push({
        userId: p.userId!,
        tipo: "taxa",
        texto: `A taxa de ${valores.nome} chegou: ${formatarReais(p.taxa)}. O valor já está em Meus itens.`,
        link: "/meus-itens",
      });
    }
  }
  if (avisos.length > 0) consultas.push(inserirNotificacoes(avisos));

  await db.batch(consultas as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

  // Fotos trocadas: as antigas saem do Cloudinary (só se nenhum item usar)
  const fotosAtuais = new Set([valores.fotoId, valores.proofWhId].filter(Boolean));
  const trocadas = [antes.fotoId, antes.proofWhId].filter(
    (id): id is string => Boolean(id) && !fotosAtuais.has(id),
  );
  if (trocadas.length > 0) await descartarFotos(trocadas);

  updateTag(`caixa-${valores.caixaId}`);
  refresh();
  return { ok: true };
}

// === Seção: Excluir item ===
// Os joiners com parte no item recebem aviso. Pagamentos já feitos são combinados por fora (a janela avisa a GOM).
export async function excluirItem(registroId: number): Promise<Resultado> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode excluir itens." };

  const [item] = Number.isInteger(registroId)
    ? await db
        .select({ nome: registro.nome, fotoId: registro.fotoId, proofWhId: registro.proofWhId, nomeCaixa: caixa.nome })
        .from(registro)
        .innerJoin(caixa, eq(registro.caixaId, caixa.id))
        .where(eq(registro.id, registroId))
    : [];
  if (!item) return { ok: false, erro: "Esse item não existe mais." };

  const joiners = await db.selectDistinct({ userId: parte.userId }).from(parte).where(eq(parte.registroId, registroId));
  const avisos: NovaNotificacao[] = joiners.map(({ userId }) => ({
    userId,
    tipo: "item",
    texto: `O item ${item.nome} (${item.nomeCaixa}) foi excluído pela GOM.`,
    link: "/meus-itens",
  }));

  // Partes, pedidos e datas das etapas saem junto (cascade no banco)
  await db.batch([
    db.delete(registro).where(eq(registro.id, registroId)),
    ...(avisos.length > 0 ? [inserirNotificacoes(avisos)] : []),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

  const fotos = [item.fotoId, item.proofWhId].filter((id): id is string => Boolean(id));
  if (fotos.length > 0) await descartarFotos(fotos);

  refresh();
  return { ok: true };
}

// === Seção: Fotos que subiram mas não ficaram em nenhum item ===
// A janela chama ao fechar sem salvar (ou ao trocar uma foto antes de salvar). Só apaga foto que nenhum item usa.
export async function descartarFotos(ids: string[]): Promise<void> {
  if (!(await ehGom())) return;
  const validas = ids
    .filter((id) => typeof id === "string" && PASTAS_FOTOS.some((pasta) => id.startsWith(pasta)))
    .slice(0, 10);
  if (validas.length === 0) return;

  const usadas = await db
    .select({ fotoId: registro.fotoId, proofWhId: registro.proofWhId })
    .from(registro)
    .where(or(inArray(registro.fotoId, validas), inArray(registro.proofWhId, validas)));
  const emUso = new Set(usadas.flatMap((r) => [r.fotoId, r.proofWhId]));

  await Promise.all(
    validas
      .filter((id) => !emUso.has(id))
      .map((id) => cloudinary.uploader.destroy(id).catch(() => undefined)),
  );
}

// === Seção: Nova etapa dos itens (com a data no histórico) ===
// Devolve as consultas para entrarem no mesmo db.batch da ação
function consultasDeEtapa(mudancas: { id: number; situacao: EtapaItem }[]): BatchItem<"pg">[] {
  if (mudancas.length === 0) return [];
  const agora = new Date();
  const porEtapa = new Map<EtapaItem, number[]>();
  for (const { id, situacao } of mudancas) porEtapa.set(situacao, [...(porEtapa.get(situacao) ?? []), id]);

  return [
    ...[...porEtapa].map(([situacao, ids]) =>
      db.update(registro).set({ situacao, situacaoAtualizadaEm: agora }).where(inArray(registro.id, ids)),
    ),
    db.insert(historicoEtapa).values(mudancas.map(({ id, situacao }) => ({ registroId: id, situacao, data: agora }))),
  ];
}

// === Seção: Mover itens para outra caixa ===
// O item segue a regra da caixa nova (fora da warehouse, ele acompanha a etapa da caixa)
// Como cada item estava antes de mover: o "Desfazer" devolve tudo para cá
export type EstadoItem = { id: number; caixaId: number; situacao: EtapaItem };
type ResultadoMover = { ok: true; anteriores: EstadoItem[] } | { ok: false; erro: string };

export async function moverItens(ids: number[], caixaId: number): Promise<ResultadoMover> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode mover itens." };
  const validos = ids.filter(Number.isInteger);
  if (validos.length === 0) return { ok: false, erro: "Escolha pelo menos um item." };

  const [destino] = Number.isInteger(caixaId)
    ? await db.select({ situacao: caixa.situacao }).from(caixa).where(eq(caixa.id, caixaId))
    : [];
  if (!destino) return { ok: false, erro: "Escolha a caixa de destino." };

  const itens = await db
    .select({ id: registro.id, caixaId: registro.caixaId, situacao: registro.situacao })
    .from(registro)
    .where(and(inArray(registro.id, validos), ne(registro.caixaId, caixaId)));
  if (itens.length === 0) return { ok: false, erro: "Esses itens já estão nessa caixa." };

  const mudancas = itens
    .map(({ id, situacao }) => ({ id, situacao: etapaItemNaCaixa(situacao, destino.situacao), antes: situacao }))
    .filter((item) => item.situacao !== item.antes);

  await db.batch([
    db
      .update(registro)
      .set({ caixaId })
      .where(
        inArray(
          registro.id,
          itens.map((item) => item.id),
        ),
      ),
    ...consultasDeEtapa(mudancas),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  refresh();
  return { ok: true, anteriores: itens };
}

// === Seção: Desfazer o "Mover" ===
// Volta cada item para a caixa e a etapa de antes (a volta também fica no histórico de etapas)
export async function desfazerMover(anteriores: EstadoItem[]): Promise<Resultado> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode mover itens." };
  const validos = anteriores.filter(
    (item) =>
      Number.isInteger(item.id) &&
      Number.isInteger(item.caixaId) &&
      enumSituacao.enumValues.includes(item.situacao),
  );
  if (validos.length === 0) return { ok: false, erro: "Nada para desfazer." };

  const agora = await db
    .select({ id: registro.id, situacao: registro.situacao })
    .from(registro)
    .where(
      inArray(
        registro.id,
        validos.map((item) => item.id),
      ),
    );
  const caixas = await db
    .select({ id: caixa.id })
    .from(caixa)
    .where(
      inArray(
        caixa.id,
        validos.map((item) => item.caixaId),
      ),
    );
  const existentes = new Set(caixas.map((c) => c.id));
  const restaurar = validos.filter((item) => existentes.has(item.caixaId) && agora.some((a) => a.id === item.id));
  if (restaurar.length === 0) return { ok: false, erro: "Esses itens não existem mais." };

  const porCaixa = new Map<number, number[]>();
  for (const item of restaurar) porCaixa.set(item.caixaId, [...(porCaixa.get(item.caixaId) ?? []), item.id]);
  const mudancas = restaurar.filter((item) => agora.find((a) => a.id === item.id)?.situacao !== item.situacao);

  await db.batch([
    ...[...porCaixa].map(([destino, idsCaixa]) => db.update(registro).set({ caixaId: destino }).where(inArray(registro.id, idsCaixa))),
    ...consultasDeEtapa(mudancas),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  refresh();
  return { ok: true };
}

// === Seção: Situação da caixa ===
// Na warehouse, os itens ficam em "esperando", "comprado" ou "na warehouse"; depois, todos seguem a caixa.
// Todo joiner com item na caixa recebe um aviso.
export async function mudarSituacaoCaixa(caixaId: number, situacao: EtapaCaixa): Promise<Resultado> {
  if (!(await ehGom())) return { ok: false, erro: "Só a GOM pode mudar a situação da caixa." };
  if (!situacaoCaixa.enumValues.includes(situacao)) return { ok: false, erro: "Situação inválida." };

  const [atual] = Number.isInteger(caixaId)
    ? await db.select({ situacao: caixa.situacao }).from(caixa).where(eq(caixa.id, caixaId))
    : [];
  if (!atual) return { ok: false, erro: "Caixa não encontrada." };
  if (atual.situacao === situacao) return { ok: true };

  const itens = await db
    .select({ id: registro.id, situacao: registro.situacao })
    .from(registro)
    .where(eq(registro.caixaId, caixaId));
  const mudancas = itens
    .map(({ id, situacao: antes }) => ({ id, antes, situacao: etapaItemNaCaixa(antes, situacao) }))
    .filter((item) => item.situacao !== item.antes);

  await db.batch([
    db.update(caixa).set({ situacao, situacaoAtualizadaEm: new Date() }).where(eq(caixa.id, caixaId)),
    ...consultasDeEtapa(mudancas),
  ] as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  await notificarEtapaCaixa(caixaId, situacao);
  refresh();
  return { ok: true };
}