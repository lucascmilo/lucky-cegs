import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import { obterCaixa, obterCaixasAbertas, obterItensCaixa, obterNomeCaixa } from "@/lib/caixas";
import { exigirUsuario } from "@/lib/sessao";
import TelaCaixa from "../_caixa/TelaCaixa";

// === Seção: Título da aba com o nome da caixa ===
export async function generateMetadata({ params }: PageProps<"/caixas/[id]">): Promise<Metadata> {
  const nome = await obterNomeCaixa(Number((await params).id));
  return { title: `${nome ?? "Caixa"} · Lucky Cegs` };
}

// === Seção: Página de uma caixa ===
// Tudo que depende do login e do banco fica dentro do Suspense: a navegação mostra o carregamento na hora.
export default function PaginaCaixa(props: PageProps<"/caixas/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <ConteudoCaixa {...props} />
    </Suspense>
  );
}

// O joiner vê todos os itens da caixa; valores e pagamentos só das próprias partes.
async function ConteudoCaixa({ params, searchParams }: PageProps<"/caixas/[id]">) {
  const { id: idTexto } = await params;
  const usuario = await exigirUsuario(`/caixas/${idTexto}`);

  const caixa = await obterCaixa(Number(idTexto));
  if (!caixa) notFound();

  const [caixasAbertas, itens, parametros] = await Promise.all([
    obterCaixasAbertas(caixa.id),
    obterItensCaixa(caixa.id, usuario.id),
    searchParams,
  ]);

  return <TelaCaixa caixa={caixa} caixasAbertas={caixasAbertas} itens={itens} eu={usuario} parametros={parametros} />;
}
