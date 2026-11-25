"use client";

import { type CSSProperties, useLayoutEffect, useRef } from "react";

// === Seção: Nome da caixa ajustado à largura das etapas ===
// O título tem o tamanho máximo; se o nome não couber até o fim da última etapa, a fonte diminui
// o necessário. Antes do JavaScript carregar, o CSS usa uma estimativa pelo número de letras.
export default function NomeCaixa({ nome }: { nome: string }) {
  const referencia = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const span = referencia.current;
    const titulo = span?.parentElement;
    if (!span || !titulo) return;

    function ajustar() {
      if (!span || !titulo) return;
      span.style.fontSize = "1em";
      if (span.scrollWidth <= 0 || titulo.clientWidth <= 0) return;
      const sobra = titulo.clientWidth / span.scrollWidth;
      if (sobra < 1) span.style.fontSize = `${Math.max(sobra, 0.55)}em`;
    }

    ajustar();
    const observador = new ResizeObserver(ajustar);
    observador.observe(titulo);
    document.fonts?.ready.then(ajustar);
    return () => observador.disconnect();
  }, [nome]);

  return (
    <span
      ref={referencia}
      className="caixaTopo__nome"
      style={{ "--letras": nome.length } as CSSProperties}
    >
      {nome}
    </span>
  );
}