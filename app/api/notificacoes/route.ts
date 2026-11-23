import { obterNotificacoes } from "@/lib/notificacoes";
import { obterUsuarioAtual } from "@/lib/sessao";

// === Seção: Notificações da conta logada ===
// O sino pergunta aqui de tempos em tempos para mostrar avisos novos sem recarregar a página.
export async function GET() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return Response.json({ erro: "Entre na sua conta." }, { status: 401 });
  return Response.json(await obterNotificacoes(usuario.id), { headers: { "Cache-Control": "no-store" } });
}
