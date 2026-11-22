import type { Metadata } from "next";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import { obterCaixasNaCasa } from "@/lib/casaDaGom";
import { exigirUsuario } from "@/lib/sessao";
import TelaCasaDaGom from "./_casaDaGom/TelaCasaDaGom";

export const metadata: Metadata = {
  title: "Casa da GOM · Lucky Cegs",
};

// === Seção: Fichário do joiner com as proofs da GOM ===
export default function PaginaCasaDaGom(props: PageProps<"/casa-da-gom">) {
  return (
    <Suspense fallback={<Carregando />}>
      <ConteudoCasaDaGom {...props} />
    </Suspense>
  );
}

async function ConteudoCasaDaGom({ searchParams }: PageProps<"/casa-da-gom">) {
  const usuario = await exigirUsuario("/casa-da-gom");
  const [caixas, parametros] = await Promise.all([obterCaixasNaCasa(usuario.id), searchParams]);
  return <TelaCasaDaGom caixas={caixas} eu={usuario} parametros={parametros} />;
}
