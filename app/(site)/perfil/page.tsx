import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { user } from "@/auth-schema";
import EsqueletoPagina from "@/componentes/EsqueletoPagina";
import { db } from "@/db";
import { exigirUsuario } from "@/lib/sessao";
import TelaPerfil from "./_perfil/TelaPerfil";

export const metadata: Metadata = {
  title: "Meu perfil · Lucky Cegs",
};

const formatadorMesAno = new Intl.DateTimeFormat("pt-BR", {
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

// === Seção: Página do perfil ===
export default function PaginaPerfil() {
  return (
    <Suspense fallback={<EsqueletoPagina tipo="ficha" />}>
      <ConteudoPerfil />
    </Suspense>
  );
}

// Nome, user e senha da própria conta. A key recria a tela ao trocar de conta (os rascunhos não passam de uma conta para outra)
async function ConteudoPerfil() {
  const usuario = await exigirUsuario("/perfil");
  const [conta] = await db.select({ nome: user.name, criadoEm: user.createdAt }).from(user).where(eq(user.id, usuario.id));
  return (
    <TelaPerfil
      key={usuario.id}
      usuario={usuario}
      nomeSalvo={conta?.nome ?? usuario.nome}
      desde={formatadorMesAno.format(conta?.criadoEm ?? new Date())}
    />
  );
}
