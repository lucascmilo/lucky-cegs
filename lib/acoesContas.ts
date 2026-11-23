"use server";

import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { refresh } from "next/cache";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { DOMINIO_EMAIL_INTERNO, PADRAO_USER } from "@/lib/configuracoes";
import { obterUsuarioAtual } from "@/lib/sessao";

// Só a GOM usa estas ações: redefinir a senha de um joiner e criar a conta de quem ainda não tem.
// Nos dois casos sai uma senha provisória para a GOM mandar; o joiner troca em Meu perfil depois de entrar.

export type ResultadoConta = { ok: true; user: string; senha: string; nova: boolean } | { ok: false; erro: string };

// Sem letras e números que se confundem (0/O, 1/l/I)
const CARACTERES = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarSenhaProvisoria() {
  return Array.from({ length: 10 }, () => CARACTERES[randomInt(CARACTERES.length)]).join("");
}

function limparUser(texto: string) {
  return texto.trim().replace(/^@/, "").toLowerCase();
}

// === Seção: Redefinir a senha de um joiner ===
// As sessões abertas da conta caem: quem estiver logado precisa entrar de novo com a senha nova.
export async function redefinirSenhaJoiner(texto: string): Promise<ResultadoConta> {
  if ((await obterUsuarioAtual())?.papel !== "admin") return { ok: false, erro: "Só a GOM pode redefinir senhas." };

  const username = limparUser(texto);
  const [conta] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.username, username));
  if (!conta) return { ok: false, erro: "Nenhuma conta com esse user." };
  if (conta.role === "admin") return { ok: false, erro: "A senha da GOM só muda em Meu perfil." };

  const senha = gerarSenhaProvisoria();
  const cabecalhos = await headers();
  try {
    await auth.api.setUserPassword({ body: { userId: conta.id, newPassword: senha }, headers: cabecalhos });
    await auth.api.revokeUserSessions({ body: { userId: conta.id }, headers: cabecalhos });
  } catch {
    return { ok: false, erro: "Não deu para redefinir a senha. Tente de novo." };
  }
  return { ok: true, user: username, senha, nova: false };
}

// === Seção: Criar a conta de um joiner ===
// O user é o do twitter; o nome começa igual ao user e o joiner pode mudar em Meu perfil.
export async function criarContaJoiner(texto: string): Promise<ResultadoConta> {
  if ((await obterUsuarioAtual())?.papel !== "admin") return { ok: false, erro: "Só a GOM pode criar contas." };

  const username = limparUser(texto);
  if (!PADRAO_USER.test(username)) return { ok: false, erro: "Use o user do twitter: de 3 a 15 letras, números ou _." };

  const [existe] = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
  if (existe) return { ok: false, erro: "Já existe uma conta com esse user." };

  const senha = gerarSenhaProvisoria();
  try {
    await auth.api.createUser({
      body: {
        email: `${username}@${DOMINIO_EMAIL_INTERNO}`,
        password: senha,
        name: username,
        role: "user",
        data: { username, displayUsername: username },
      },
      headers: await headers(),
    });
  } catch {
    return { ok: false, erro: "Não deu para criar a conta. Tente de novo." };
  }

  refresh();
  return { ok: true, user: username, senha, nova: true };
}
