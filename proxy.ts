import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// === Seção: Redirecionamento das telas de acesso ===
// Checagem otimista: quem já tem cookie de sessão não precisa ver Entrar/Criar conta.
// A validação real de permissão continua sendo feita no servidor de cada página/ação.
export function proxy(requisicao: NextRequest) {
  if (getSessionCookie(requisicao)) {
    return NextResponse.redirect(new URL("/", requisicao.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/entrar", "/criar-conta"],
};
