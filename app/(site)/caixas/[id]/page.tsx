import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obterCaixa, obterCaixasAbertas, obterItensCaixa } from "@/lib/caixas";
import { exigirUsuario } from "@/lib/sessao";
import TelaCaixa from "../_caixa/TelaCaixa";

// === Seção: Título da aba com o nome da caixa ===
export async function generateMetadata({ params }: PageProps<"/caixas/[id]">): Promise<Metadata> {
  const caixa = await obterCaixa(Number((await params).id));
  return { title: `${caixa?.nome ?? "Caixa"} · Lucky Cegs` };
}

// === Seção: Página de uma caixa ===
// O joiner vê todos os itens da caixa; valores e pagamentos só das próprias partes.
export default async function PaginaCaixa({ params, searchParams }: PageProps<"/caixas/[id]">) {
  const { id: idTexto } = await params;
  const usuario = await exigirUsuario(`/caixas/${idTexto}`);

  const id = Number(idTexto);
  const caixa = await obterCaixa(id);
  if (!caixa) notFound();

  const [caixasAbertas, itens, parametros] = await Promise.all([
    obterCaixasAbertas(caixa.id),
    obterItensCaixa(caixa.id, usuario.id),
    searchParams,
  ]);

  return <TelaCaixa caixa={caixa} caixasAbertas={caixasAbertas} itens={itens} eu={usuario} parametros={parametros} />;
}
