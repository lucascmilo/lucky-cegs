import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Carregando from "@/componentes/Carregando";
import { obterCaixa, obterCaixasAbertas, obterItensCaixa, obterNomeCaixa } from "@/lib/caixas";
import { obterCaixasGom, obterJoiners, obterRegistrosGom } from "@/lib/caixasGom";
import { textoDoParametro } from "@/lib/navegacao";
import { exigirUsuario } from "@/lib/sessao";
import TelaCaixa from "../_caixa/TelaCaixa";
import TelaCaixaGom from "../_caixaGom/TelaCaixaGom";

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
// A GOM vê a planilha completa, com compra e lucro.
async function ConteudoCaixa({ params, searchParams }: PageProps<"/caixas/[id]">) {
  const { id: idTexto } = await params;
  const usuario = await exigirUsuario(`/caixas/${idTexto}`);

  if (usuario.papel === "admin") {
    const id = Number(idTexto);
    const caixas = await obterCaixasGom();
    const caixa = caixas.find((c) => c.id === id);
    if (!caixa) notFound();

    const [registros, joiners, parametros] = await Promise.all([obterRegistrosGom(id), obterJoiners(), searchParams]);
    return (
      <TelaCaixaGom
        caixa={caixa}
        caixas={caixas}
        registros={registros}
        joiners={joiners}
        abrirNovoItem={textoDoParametro(parametros.novo) === "1"}
        abrirNovaCaixa={textoDoParametro(parametros.nova) === "1"}
        inicialPlanilha={{
          busca: textoDoParametro(parametros.busca),
          ordem: textoDoParametro(parametros.ordem),
          filtro: textoDoParametro(parametros.filtro),
        }}
      />
    );
  }

  const caixa = await obterCaixa(Number(idTexto));
  if (!caixa) notFound();

  const [caixasAbertas, itens, parametros] = await Promise.all([
    obterCaixasAbertas(caixa.id),
    obterItensCaixa(caixa.id, usuario.id),
    searchParams,
  ]);

  return <TelaCaixa caixa={caixa} caixasAbertas={caixasAbertas} itens={itens} eu={usuario} parametros={parametros} />;
}
