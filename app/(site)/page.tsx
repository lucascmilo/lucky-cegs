import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import FaixaLetreiro from "@/componentes/FaixaLetreiro";
import { obterCaixasRecentes, obterFaltaPagar } from "@/lib/joiner";
import { obterUsuarioAtual } from "@/lib/sessao";
import AcoesJoiner from "./_inicio/AcoesJoiner";
import HeroInicio from "./_inicio/HeroInicio";
import SecaoCasaDaGom from "./_inicio/SecaoCasaDaGom";
import SecaoEtapas from "./_inicio/SecaoEtapas";
import SecaoSuasCaixas, { type ListaCaixas } from "./_inicio/SecaoSuasCaixas";
import "@/estilos/paginas/InicioJoiner.css";

// === Seção: Tela inicial ===
// Visitante vê só o hero; joiner vê também as seções dele; GOM vai para o painel.
export default function PaginaInicial() {
  return (
    <Suspense fallback={<HeroInicio />}>
      <InicioPorCookie />
    </Suspense>
  );
}

// Checagem rápida (sem banco): quem tem cookie de sessão já vê o esqueleto da tela do joiner,
// em vez de ver o hero de visitante piscar enquanto os dados carregam.
async function InicioPorCookie() {
  if (!getSessionCookie(await headers())) return <HeroInicio />;

  return (
    <Suspense
      fallback={
        <ViewTransition exit="esqueleto-sai" default="none">
          <InicioJoiner faltaPagar={null} caixas={null} />
        </ViewTransition>
      }
    >
      <ViewTransition enter="conteudo-entra" default="none">
        <InicioPorPerfil />
      </ViewTransition>
    </Suspense>
  );
}

async function InicioPorPerfil() {
  const usuario = await obterUsuarioAtual();
  if (usuario?.papel === "admin") redirect("/painel");
  if (!usuario) return <HeroInicio />;

  const [faltaPagar, caixas] = await Promise.all([obterFaltaPagar(usuario.id), obterCaixasRecentes(usuario.id)]);
  return <InicioJoiner faltaPagar={faltaPagar} caixas={caixas} />;
}

// === Seção: Tela do joiner (null = ainda carregando) ===
function InicioJoiner({ faltaPagar, caixas }: { faltaPagar: number | null; caixas: ListaCaixas }) {
  return (
    <>
      <HeroInicio acoes={<AcoesJoiner faltaPagar={faltaPagar} />} />
      <FaixaLetreiro variante="preta" className="inicioJoiner__letreiro" />
      <SecaoSuasCaixas caixas={caixas} />
      <SecaoEtapas />
      <SecaoCasaDaGom />
    </>
  );
}
