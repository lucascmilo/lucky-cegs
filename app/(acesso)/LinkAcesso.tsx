"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { destinoDepoisDoLogin } from "@/lib/navegacao";

// O ?voltar só existe no navegador; no servidor o link sai sem ele
const semAssinatura = () => () => {};

type PropsLinkAcesso = {
  para: "/entrar" | "/criar-conta";
  className?: string;
  children: ReactNode;
};

// === Seção: Link entre Entrar e Criar conta ===
// Leva junto o ?voltar, para a pessoa voltar à página de onde veio (ex.: Sem dono)
export default function LinkAcesso({ para, className, children }: PropsLinkAcesso) {
  const voltar = useSyncExternalStore(semAssinatura, destinoDepoisDoLogin, () => "/");
  const destinoSeguro = voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : "/";
  const endereco =
    destinoSeguro === "/" ? para : `${para}?voltar=${encodeURIComponent(destinoSeguro)}`;

  return (
    <Link href={endereco} className={className}>
      {children}
    </Link>
  );
}