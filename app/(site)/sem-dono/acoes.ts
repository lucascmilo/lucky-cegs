"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { claim, registro } from "@/db/schema";
import { obterUsuarioAtual } from "@/lib/sessao";

export type ResultadoPedido = { ok: true } | { ok: false; erro: string };

// === Seção: Pedir um item sem dono ("Quero esse") ===
// Só joiners logados. Não dá para desistir depois; a GOM confirma por ordem dos pedidos.
export async function pedirItemSemDono(registroId: number): Promise<ResultadoPedido> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return { ok: false, erro: "Entre na sua conta para pedir um item." };
  if (!Number.isInteger(registroId)) return { ok: false, erro: "Item inválido." };

  const [item] = await db
    .select({ semDono: registro.semDono })
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
  }

  refresh();
  return { ok: true };
}
