import type { Metadata } from "next";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import { obterItensSemDono } from "@/lib/semDono";
import { obterSemDonoGom } from "@/lib/semDonoGom";
import { obterUsuarioAtual } from "@/lib/sessao";
import TelaSemDono from "./_semDono/TelaSemDono";
import TelaSemDonoGom from "./_semDono/TelaSemDonoGom";

export const metadata: Metadata = {
  title: "Itens sem dono · Lucky Cegs",
};

// === Seção: Página de itens sem dono ===
// Qualquer pessoa vê os itens; para pedir ("Quero esse") precisa estar logada.
// A GOM vê a tabela com os pedidos de claim e escolhe quem fica com cada item.
export default function PaginaSemDono(props: PageProps<"/sem-dono">) {
  return (
    <Suspense fallback={<Carregando />}>
      <ConteudoSemDono {...props} />
    </Suspense>
  );
}

async function ConteudoSemDono({ searchParams }: PageProps<"/sem-dono">) {
  const usuario = await obterUsuarioAtual();
  if (usuario?.papel === "admin") return <TelaSemDonoGom dados={await obterSemDonoGom()} />;

  const [itens, parametros] = await Promise.all([obterItensSemDono(usuario?.id ?? null), searchParams]);
  return <TelaSemDono itens={itens} logado={Boolean(usuario)} parametros={parametros} />;
}
