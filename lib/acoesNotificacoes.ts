"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { notificacao } from "@/db/schema";
import { obterUsuarioAtual } from "@/lib/sessao";

// === Seção: Marcar as notificações como lidas ===
// Só as da própria conta; roda quando a lista do sino é aberta
export async function marcarNotificacoesLidas() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return;
  await db
    .update(notificacao)
    .set({ lida: true })
    .where(and(eq(notificacao.userId, usuario.id), eq(notificacao.lida, false)));
  refresh();
}
