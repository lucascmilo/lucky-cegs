"use client";

import { useEffect, useState } from "react";
import { juntarClasses } from "@/lib/classes";
import { IconeCopiar } from "./Icones";
import "@/estilos/componentes/BotaoCopiar.css";

const TEMPO_MENSAGEM_COPIADO = 1800;

// === Seção: Tipos ===
type PropsBotaoCopiar = {
  texto: string;
  variante?: "escuro" | "rosa";
  className?: string;
};

// === Seção: Botão de copiar para a área de transferência ===
export default function BotaoCopiar({ texto, variante = "escuro", className }: PropsBotaoCopiar) {
  const [copiado, setCopiado] = useState(false);

  // Volta o texto para "Copiar" alguns instantes depois de copiar
  useEffect(() => {
    if (!copiado) return;
    const temporizador = setTimeout(() => setCopiado(false), TEMPO_MENSAGEM_COPIADO);
    return () => clearTimeout(temporizador);
  }, [copiado]);

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Sem permissão de área de transferência: o botão só não mostra "Copiado!"
    }
  }

  return (
    <button
      type="button"
      onClick={copiarTexto}
      className={juntarClasses("botaoCopiar", `botaoCopiar__${variante}`, className)}
    >
      <IconeCopiar className="botaoCopiar__icone" />
      <span aria-live="polite">{copiado ? "Copiado!" : "Copiar"}</span>
    </button>
  );
}
