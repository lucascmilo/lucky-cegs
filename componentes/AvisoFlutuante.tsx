"use client";

import { useEffect, useSyncExternalStore } from "react";
import { IconeCheck } from "./Icones";
import "@/estilos/componentes/AvisoFlutuante.css";

// === Seção: Aviso flutuante ("Item salvo", "Caixa criada"…) ===
// Qualquer parte da tela chama mostrarAviso(); o aviso aparece embaixo, no meio, e some sozinho.

const DURACAO = 5000;
let texto: string | null = null;
let contador = 0;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function mostrarAviso(novo: string) {
  texto = novo;
  contador += 1;
  avisar();
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export default function AvisoFlutuante() {
  const atual = useSyncExternalStore(
    inscrever,
    () => (texto ? `${contador}|${texto}` : null),
    () => null,
  );

  useEffect(() => {
    if (!atual) return;
    const tempo = window.setTimeout(() => {
      texto = null;
      avisar();
    }, DURACAO);
    return () => window.clearTimeout(tempo);
  }, [atual]);

  return (
    <p className="avisoFlutuante" role="status">
      {atual && (
        <span key={atual} className="avisoFlutuante__caixa">
          <IconeCheck tamanho={12} /> {atual.slice(atual.indexOf("|") + 1)}
        </span>
      )}
    </p>
  );
}
