import type { Metadata } from "next";
import { Suspense } from "react";
import EsqueletoPagina from "@/componentes/EsqueletoPagina";
import { textoDoParametro } from "@/lib/navegacao";
import { obterCaixasComProofs, obterProofsDaCaixa } from "@/lib/proofs";
import { exigirGom } from "@/lib/sessao";
import TelaProofs from "./_proofs/TelaProofs";

export const metadata: Metadata = {
  title: "Proofs · Lucky Cegs",
};

// === Seção: Proofs da casa da GOM ===
// A caixa e o joiner escolhidos ficam no endereço (?caixa=…&joiner=…), como nos links do painel.
export default function PaginaProofs(props: PageProps<"/proofs">) {
  return (
    <Suspense fallback={<EsqueletoPagina tipo="cartoes" />}>
      <ConteudoProofs {...props} />
    </Suspense>
  );
}

async function ConteudoProofs({ searchParams }: PageProps<"/proofs">) {
  const gom = await exigirGom("/proofs");
  const [caixas, parametros] = await Promise.all([obterCaixasComProofs(), searchParams]);

  const pedida = Number(textoDoParametro(parametros.caixa));
  const caixaId = caixas.some((c) => c.id === pedida) ? pedida : caixas[0]?.id;
  const dados = caixaId ? await obterProofsDaCaixa(caixaId, gom.id) : null;

  return <TelaProofs caixas={caixas} dados={dados} joinerPedido={textoDoParametro(parametros.joiner)} />;
}
