"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { claim, parte, registro } from "@/db/schema";
import { inserirNotificacoes, notificar, obterIdsDaGom, type NovaNotificacao } from "@/lib/notificacoes";
import { obterUsuarioAtual } from "@/lib/sessao";

type ResultadoPedido = { ok: true } | { ok: false; erro: string };

// === Seção: Pedir um item sem dono ("Quero esse") ===
// Só joiners logados. Não dá para desistir depois; a GOM confirma por ordem dos pedidos.
export async function pedirItemSemDono(registroId: number): Promise<ResultadoPedido> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return { ok: false, erro: "Entre na sua conta para pedir um item." };
  if (!Number.isInteger(registroId)) return { ok: false, erro: "Item inválido." };

  const [item] = await db
    .select({ semDono: registro.semDono, nome: registro.nome })
    .from(registro)
    .where(eq(registro.id, registroId));
  if (!item?.semDono) return { ok: false, erro: "Esse item não está mais sem dono." };

  // Um pedido aberto por pessoa por item (se a GOM recusar, a pessoa pode pedir de novo)
  const [jaPediu] = await db
    .select({ id: claim.id })
    .from(claim)
    .where(and(eq(claim.registroId, registroId), eq(claim.userId, usuario.id), eq(claim.status, "pedido")));

  if (!jaPediu) {
    await db.insert(claim).values({ registroId, userId: usuario.id });
    // A GOM só recebe notificação de pedido de claim
    const gom = await obterIdsDaGom();
    await notificar(
      gom.map((userId) => ({
        userId,
        tipo: "claim_pedido",
        texto: `@${usuario.user} pediu o item sem dono ${item.nome}.`,
        link: "/sem-dono",
      })),
    );
  }

  refresh();
  return { ok: true };
}

// === Seção: Dar um item sem dono (só a GOM) ===
// O item passa a ser da pessoa com o valor que tiver agora (inter e taxa ficam "em breve").
// Esse pedido é aceito e os outros pedidos do item são recusados, tudo de uma vez.
export async function darItemSemDono(registroId: number, userId: string): Promise<ResultadoPedido> {
  const usuario = await obterUsuarioAtual();
  if (usuario?.papel !== "admin") return { ok: false, erro: "Só a GOM pode dar itens." };
  if (!Number.isInteger(registroId) || !userId) return { ok: false, erro: "Escolha um joiner." };

  const [item] = await db
    .select({ semDono: registro.semDono, nome: registro.nome, preco: registro.precoSemDono, membro: registro.membro })
    .from(registro)
    .where(eq(registro.id, registroId));
  if (!item?.semDono) return { ok: false, erro: "Esse item não está mais sem dono." };

  const [pedido] = await db
    .select({ id: claim.id })
    .from(claim)
    .where(and(eq(claim.registroId, registroId), eq(claim.userId, userId), eq(claim.status, "pedido")));
  if (!pedido) return { ok: false, erro: "Esse joiner não pediu o item." };

  // Quem pediu e não levou fica sabendo junto
  const outros = await db
    .selectDistinct({ userId: claim.userId })
    .from(claim)
    .where(and(eq(claim.registroId, registroId), eq(claim.status, "pedido"), ne(claim.userId, userId)));
  const avisos: NovaNotificacao[] = [
    {
      userId,
      tipo: "claim_aceito",
      texto: `Seu pedido de ${item.nome} foi aceito. O item já está em Meus itens.`,
      link: "/meus-itens",
    },
    ...outros.map((outro): NovaNotificacao => ({
      userId: outro.userId,
      tipo: "claim_recusado",
      texto: `O item sem dono ${item.nome} ficou com outra pessoa da fila.`,
      link: "/sem-dono",
    })),
  ];

  await db.batch([
    db.insert(parte).values({ registroId, userId, membro: item.membro, venda: item.preco }),
    db.update(registro).set({ semDono: false }).where(eq(registro.id, registroId)),
    db.update(claim).set({ status: "aceito" }).where(eq(claim.id, pedido.id)),
    db
      .update(claim)
      .set({ status: "recusado" })
      .where(and(eq(claim.registroId, registroId), eq(claim.status, "pedido"))),
    inserirNotificacoes(avisos),
  ]);

  refresh();
  return { ok: true };
}

// === Seção: Apagar o anúncio de um item sem dono (só a GOM) ===
// Para itens vendidos por fora: o item sai do site e os pedidos esperando somem junto.
export async function apagarItemSemDono(registroId: number): Promise<ResultadoPedido> {
  const usuario = await obterUsuarioAtual();
  if (usuario?.papel !== "admin") return { ok: false, erro: "Só a GOM pode apagar anúncios." };
  if (!Number.isInteger(registroId)) return { ok: false, erro: "Item inválido." };

  const [item] = await db
    .select({ semDono: registro.semDono, nome: registro.nome })
    .from(registro)
    .where(eq(registro.id, registroId));
  if (!item?.semDono) return { ok: false, erro: "Esse item não está mais sem dono." };

  // Quem estava na fila fica sabendo que o item saiu
  const fila = await db
    .selectDistinct({ userId: claim.userId })
    .from(claim)
    .where(and(eq(claim.registroId, registroId), eq(claim.status, "pedido")));

  // Pedidos e datas das etapas saem junto (cascade no banco)
  await db.delete(registro).where(and(eq(registro.id, registroId), eq(registro.semDono, true)));
  await notificar(
    fila.map(({ userId }) => ({
      userId,
      tipo: "claim_recusado",
      texto: `O item sem dono ${item.nome} saiu da lista.`,
      link: "/sem-dono",
    })),
  );
  refresh();
  return { ok: true };
}
