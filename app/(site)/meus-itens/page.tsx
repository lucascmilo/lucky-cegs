import type { Metadata } from "next";
import { Suspense } from "react";
import EsqueletoPagina from "@/componentes/EsqueletoPagina";
import { obterMeusItens } from "@/lib/meusItens";
import { exigirUsuario } from "@/lib/sessao";
import TelaMeusItens from "./_meusItens/TelaMeusItens";

export const metadata: Metadata = {
  title: "Meus itens · Lucky Cegs",
};

// === Seção: Página dos itens do joiner ===
export default function PaginaMeusItens(props: PageProps<"/meus-itens">) {
  return (
    <Suspense fallback={<EsqueletoPagina tipo="cartoes" />}>
      <ConteudoMeusItens {...props} />
    </Suspense>
  );
}

// Só os itens em que o joiner tem parte, com os próprios valores e pagamentos
async function ConteudoMeusItens({ searchParams }: PageProps<"/meus-itens">) {
  const usuario = await exigirUsuario("/meus-itens");
  const [caixas, parametros] = await Promise.all([obterMeusItens(usuario.id), searchParams]);
  return <TelaMeusItens caixas={caixas} parametros={parametros} />;
}
