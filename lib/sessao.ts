import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { enderecoEntrar, type Papel } from "@/lib/navegacao";

// === Seção: Usuário atual ===
export type UsuarioAtual = {
  id: string;
  nome: string;
  user: string;
  papel: Exclude<Papel, null>;
};

// Lê a sessão do Better Auth e devolve só o necessário para a interface.
// "cache" faz cabeçalho, rodapé e página dividirem uma única leitura por requisição.
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  // Marca a leitura como dinâmica: o Better Auth usa a data atual, o que não pode acontecer no pré-render
  await connection();
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (!sessao) return null;

  const { user } = sessao;
  return {
    id: user.id,
    // Nomes aparecem sempre em minúsculas no site
    nome: user.name.toLowerCase(),
    user: user.username ?? "",
    papel: user.role === "admin" ? "admin" : "user",
  };
});

// === Seção: Página só para quem está logado ===
// Sem login, manda para Entrar e guarda a página para voltar depois.
export async function exigirUsuario(paginaAtual: string) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect(enderecoEntrar(paginaAtual));
  return usuario;
}

// === Seção: Página só da GOM ===
// Quem não é GOM volta para o início.
export async function exigirGom(paginaAtual: string) {
  const usuario = await exigirUsuario(paginaAtual);
  if (usuario.papel !== "admin") redirect("/");
  return usuario;
}
