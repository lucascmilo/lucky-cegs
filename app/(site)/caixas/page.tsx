import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import CartaoAviso from "@/componentes/CartaoAviso";
import { obterCaixaPadrao } from "@/lib/caixas";
import { obterCaixaMaisRecente } from "@/lib/caixasGom";
import { textoDoParametro } from "@/lib/navegacao";
import { exigirUsuario } from "@/lib/sessao";
import BotaoNovaCaixa from "./_caixaGom/BotaoNovaCaixa";

// === Seção: /caixas abre uma caixa ===
// Joiner: a caixa mais recente com itens dele. GOM: a caixa mais recente.
// A GOM chega aqui pelo Painel com ?novo=1 (abre "Novo item") ou ?nova=1 (abre "Nova caixa").
export default function PaginaCaixas(props: PageProps<"/caixas">) {
  return (
    <Suspense fallback={<Carregando />}>
      <CaixaPadrao {...props} />
    </Suspense>
  );
}

async function CaixaPadrao({ searchParams }: PageProps<"/caixas">) {
  const usuario = await exigirUsuario("/caixas");
  const gom = usuario.papel === "admin";

  const [id, parametros] = await Promise.all([
    gom ? obterCaixaMaisRecente() : obterCaixaPadrao(usuario.id),
    searchParams,
  ]);
  const abrir = gom ? (["novo", "nova"] as const).find((chave) => textoDoParametro(parametros[chave]) === "1") : undefined;
  if (id) redirect(`/caixas/${id}${abrir ? `?${abrir}=1` : ""}`);

  return (
    <CartaoAviso
      selo="0"
      etiqueta="NENHUMA CAIXA ABERTA"
      tituloPreto="AINDA SEM"
      tituloRosa="CAIXAS"
      cursiva="logo, logo chega uma…"
      texto={
        gom
          ? "Crie a primeira caixa: ela aparece aqui com a planilha dos itens."
          : "Quando a GOM abrir uma caixa, ela aparece aqui com todos os itens."
      }
    >
      {gom ? (
        <BotaoNovaCaixa abrir={abrir === "nova"} />
      ) : (
        <Link href="/" className="botao botao__rosa">
          Voltar para o início
        </Link>
      )}
    </CartaoAviso>
  );
}
