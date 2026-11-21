import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { Papel } from "@/lib/navegacao";

// === Seção: Usuário atual (servidor) ===
export type UsuarioAtual = {
  nome: string;
  user: string;
  papel: Exclude<Papel, null>;
};

// Lê a sessão do Better Auth e devolve só o necessário para a interface.
export async function obterUsuarioAtual(): Promise<UsuarioAtual | null> {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (!sessao) return null;

  const { user } = sessao;
  return {
    nome: user.name,
    user: user.username ?? "",
    papel: user.role === "admin" ? "admin" : "user",
  };
}
