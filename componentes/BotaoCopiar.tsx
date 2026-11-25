"use client";

import { useEffect, useState } from "react";
import { IconeCopiar } from "./Icones";
import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/BotaoCopiar.css";

const TEMPO_MENSAGEM_COPIADO = 1800;

// === Seção: Tipos ===
type PropsBotaoCopiar = {
  texto: string;
  variante?: "escuro" | "rosa" | "claro";
  className?: string;
};

// === Seção: Botão de copiar para a área de transferência ===
export default function BotaoCopiar({ texto, variante = "escuro", className }: PropsBotaoCopiar) {
  const [copiado, setCopiado] = useState(false);

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
      // Sem acesso à área de transferência: só não mostra "Copiado!"
    }
  }

  return (
    <button
      type="button"
      onClick={copiarTexto}
      aria-label={copiado ? "Texto copiado" : "Copiar texto"}
      className={juntarClasses("botaoCopiar", `botaoCopiar__${variante}`, className)}
    >
      <IconeCopiar className="botaoCopiar__icone" aria-hidden="true" />
      <span aria-live="polite">{copiado ? "Copiado!" : "Copiar"}</span>
    </button>
  );
}