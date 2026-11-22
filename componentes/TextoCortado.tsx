"use client";

import { useEffect, useRef, useState } from "react";
import "@/estilos/componentes/TextoCortado.css";

// === Seção: Título que termina em "…" e mostra o texto inteiro ao clicar ===
// O texto completo abre num balão por cima, sem mudar o tamanho do card.
export default function TextoCortado({ texto }: { texto: string }) {
  const referenciaCaixa = useRef<HTMLSpanElement>(null);
  const [cortado, setCortado] = useState(false);
  const [aberto, setAberto] = useState(false);

  // Só vira clicável quando o texto realmente não cabe
  useEffect(() => {
    const caixa = referenciaCaixa.current;
    if (!caixa) return;
    const observador = new ResizeObserver(() => {
      const linha = caixa.querySelector(".textoCortado__linha");
      if (linha) setCortado(linha.scrollWidth > linha.clientWidth + 1);
    });
    observador.observe(caixa);
    return () => observador.disconnect();
  }, [texto]);

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: PointerEvent) {
      if (!referenciaCaixa.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  return (
    <span className="textoCortado" ref={referenciaCaixa}>
      {cortado ? (
        <button
          type="button"
          className="textoCortado__botao"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          title="Ver nome completo"
        >
          <span className="textoCortado__linha">
            {texto}
          </span>
        </button>
      ) : (
        <span className="textoCortado__linha">
          {texto}
        </span>
      )}

      {aberto && (
        <span className="textoCortado__balao" role="status">
          {texto}
        </span>
      )}
    </span>
  );
}
