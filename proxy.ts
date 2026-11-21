import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/navegacao";

// === Seção: Redirecionamento das telas de acesso ===
// Checagem otimista: quem já tem cookie de sessão não precisa ver Entrar/Criar conta e vai
// direto para a página que tentou abrir (ou para o início).
// A validação real de permissão continua sendo feita no servidor de cada página/ação.
export function proxy(requisicao: NextRequest) {
  if (!getSessionCookie(requisicao)) return NextResponse.next();

  const destino = destinoSeguro(requisicao.nextUrl.searchParams.get("voltar"));
  return NextResponse.redirect(new URL(destino, requisicao.url));
}

export const config = {
  matcher: ["/entrar", "/criar-conta"],
};
