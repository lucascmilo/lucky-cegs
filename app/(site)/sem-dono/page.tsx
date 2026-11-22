import type { Metadata } from "next";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import { obterItensSemDono } from "@/lib/semDono";
import { obterUsuarioAtual } from "@/lib/sessao";
import TelaSemDono from "./_semDono/TelaSemDono";

export const metadata: Metadata = {
  title: "Itens sem dono · Lucky Cegs",
};

// === Seção: Página de itens sem dono ===
// Qualquer pessoa vê os itens; para pedir ("Quero esse") precisa estar logada.
export default function PaginaSemDono(props: PageProps<"/sem-dono">) {
  return (
    <Suspense fallback={<Carregando />}>
      <ConteudoSemDono {...props} />
    </Suspense>
  );
}

async function ConteudoSemDono({ searchParams }: PageProps<"/sem-dono">) {
  const usuario = await obterUsuarioAtual();
  const [itens, parametros] = await Promise.all([obterItensSemDono(usuario?.id ?? null), searchParams]);
  return <TelaSemDono itens={itens} logado={Boolean(usuario)} parametros={parametros} />;
}
