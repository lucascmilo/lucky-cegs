"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/PecasItem.css";

// === Seção: Novidades desde a última visita ===
// A última visita a cada caixa fica guardada só no navegador da pessoa.
// Sem visita registrada, conta como novo o que mudou nos últimos 3 dias.
const PREFIXO = "lucky-cegs:visita-caixa-";
const JANELA_SEM_VISITA = 3 * 24 * 60 * 60 * 1000;

function lerVisita(caixaId: number) {
  try {
    return localStorage.getItem(PREFIXO + caixaId);
  } catch {
    return null;
  }
}

function inscrever(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}

// === Seção: Selo "novo" ===
type PropsSeloNovo = {
  caixaId: number;
  atualizadoEm: Date | string;
  texto?: string;
  className?: string;
};

export function SeloNovo({ caixaId, atualizadoEm, texto = "NOVO", className }: PropsSeloNovo) {
  const mudouEm = useMemo(() => new Date(atualizadoEm).getTime(), [atualizadoEm]);
  const limiteSemVisita = useMemo(() => Date.now() - JANELA_SEM_VISITA, []);

  // No servidor nunca aparece; no navegador, compara com a última visita
  const ehNovo = useSyncExternalStore(
    inscrever,
    () => {
      const visita = lerVisita(caixaId);
      return visita ? mudouEm > Number(visita) : mudouEm > limiteSemVisita;
    },
    () => false,
  );

  if (!ehNovo) return null;
  return <span className={juntarClasses("seloNovo", className)}>{texto}</span>;
}

// === Seção: Registra a visita à caixa ===
// Grava ao sair da página: durante a visita, os selos continuam aparecendo.
export function RegistroVisita({ caixaId }: { caixaId: number }) {
  useEffect(() => {
    function registrar() {
      try {
        localStorage.setItem(PREFIXO + caixaId, String(Date.now()));
      } catch {
        // Sem acesso ao armazenamento (aba anônima bloqueada): só não guarda a visita
      }
    }
    window.addEventListener("pagehide", registrar);
    return () => {
      window.removeEventListener("pagehide", registrar);
      registrar();
    };
  }, [caixaId]);

  return null;
}