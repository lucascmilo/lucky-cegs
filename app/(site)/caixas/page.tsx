import Link from "next/link";
import { redirect } from "next/navigation";
import CartaoAviso from "@/componentes/CartaoAviso";
import { obterCaixaPadrao } from "@/lib/caixas";
import { exigirUsuario } from "@/lib/sessao";

// === Seção: /caixas abre a caixa mais recente do joiner ===
export default async function PaginaCaixas() {
  const usuario = await exigirUsuario("/caixas");

  const id = await obterCaixaPadrao(usuario.id);
  if (id) redirect(`/caixas/${id}`);

  return (
    <CartaoAviso
      selo="0"
      etiqueta="NENHUMA CAIXA ABERTA"
      tituloPreto="AINDA SEM"
      tituloRosa="CAIXAS"
      cursiva="logo, logo chega uma…"
      texto="Quando a GOM abrir uma caixa, ela aparece aqui com todos os itens."
    >
      <Link href="/" className="botao botao__rosa">
        Voltar para o início
      </Link>
    </CartaoAviso>
  );
}
