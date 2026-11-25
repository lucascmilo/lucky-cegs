import type { Metadata } from "next";
import { Suspense } from "react";
import EsqueletoPagina from "@/componentes/EsqueletoPagina";
import { obterJoiners } from "@/lib/caixasGom";
import { obterCaixasEmAndamento, obterProofsParaSubir, obterQuemFaltaPagar } from "@/lib/painel";
import { exigirGom } from "@/lib/sessao";
import TelaPainel from "./_painel/TelaPainel";

export const metadata: Metadata = {
  title: "Painel · Lucky Cegs",
};

// === Seção: Painel inicial da GOM ===
export default function PaginaPainel(props: PageProps<"/painel">) {
  return (
    <Suspense fallback={<EsqueletoPagina tipo="cartoes" />}>
      <ConteudoPainel {...props} />
    </Suspense>
  );
}

// Só a GOM vê valores de todos os joiners
async function ConteudoPainel({ searchParams }: PageProps<"/painel">) {
  await exigirGom("/painel");
  const [devendo, caixas, proofs, joiners, parametros] = await Promise.all([
    obterQuemFaltaPagar(),
    obterCaixasEmAndamento(),
    obterProofsParaSubir(),
    obterJoiners(),
    searchParams,
  ]);

  // Só no desenvolvimento: /painel?previa=proofs-em-dia mostra o aviso de quando todas as proofs subiram
  const previaEmDia =
    process.env.NODE_ENV === "development" && parametros.previa === "proofs-em-dia";
  return (
    <TelaPainel
      devendo={devendo}
      caixas={caixas}
      proofs={previaEmDia ? [] : proofs}
      joiners={joiners}
    />
  );
}