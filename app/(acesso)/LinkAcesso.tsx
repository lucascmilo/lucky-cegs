"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { destinoDepoisDoLogin } from "@/lib/navegacao";

// O ?voltar só existe no navegador; no servidor o link sai sem ele
const semAssinatura = () => () => {};

// === Seção: Link entre Entrar e Criar conta ===
// Leva junto o ?voltar, para a pessoa voltar à página de onde veio (ex.: Sem dono)
export default function LinkAcesso({ para, children }: { para: "/entrar" | "/criar-conta"; children: ReactNode }) {
  const voltar = useSyncExternalStore(semAssinatura, destinoDepoisDoLogin, () => "/");
  const endereco = voltar === "/" ? para : `${para}?voltar=${encodeURIComponent(voltar)}`;
  return <Link href={endereco}>{children}</Link>;
}
