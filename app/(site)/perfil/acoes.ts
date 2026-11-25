"use server";

import { and, eq, ne, or } from "drizzle-orm";
import { refresh } from "next/cache";
import { user } from "@/auth-schema";
import { db } from "@/db";
import {
  DOMINIO_EMAIL_INTERNO,
  PADRAO_USER,
  TAMANHO_MAXIMO_NOME,
} from "@/lib/configuracoes";
import { MENSAGEM_USER_INVALIDO, limparUser } from "@/lib/mensagensErro";
import { obterUsuarioAtual } from "@/lib/sessao";

type Resultado = { ok: true } | { ok: false; erro: string };

// === Seção: Alterar o nome ===
// Cada conta só altera os próprios dados
export async function alterarNome(nome: string): Promise<Resultado> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return { ok: false, erro: "Entre na sua conta para alterar o nome." };

  const nomeLimpo = String(nome).trim().replace(/\s+/g, " ");
  if (!nomeLimpo) return { ok: false, erro: "Informe um nome." };
  if (nomeLimpo.length > TAMANHO_MAXIMO_NOME) {
    return { ok: false, erro: `Use no máximo ${TAMANHO_MAXIMO_NOME} caracteres.` };
  }

  await db
    .update(user)
    .set({ name: nomeLimpo, updatedAt: new Date() })
    .where(eq(user.id, usuario.id));
  refresh();
  return { ok: true };
}

// === Seção: Alterar o user (@) ===
// O e-mail interno acompanha o user, para o @ antigo ficar livre para outra conta
export async function alterarUser(novoUser: string): Promise<Resultado> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return { ok: false, erro: "Entre na sua conta para alterar o user." };

  const exibido = limparUser(String(novoUser));
  if (!PADRAO_USER.test(exibido)) return { ok: false, erro: MENSAGEM_USER_INVALIDO };

  const normalizado = exibido.toLowerCase();
  const email = `${normalizado}@${DOMINIO_EMAIL_INTERNO}`;

  const [ocupado] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        ne(user.id, usuario.id),
        or(eq(user.username, normalizado), eq(user.email, email)),
      ),
    )
    .limit(1);
  if (ocupado) {
    return { ok: false, erro: "Esse user já é de outra conta. Escolha outro." };
  }

  await db
    .update(user)
    .set({
      username: normalizado,
      displayUsername: exibido,
      email,
      updatedAt: new Date(),
    })
    .where(eq(user.id, usuario.id));
  refresh();
  return { ok: true };
}