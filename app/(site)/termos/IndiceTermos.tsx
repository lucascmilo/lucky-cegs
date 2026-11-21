"use client";

import { useEffect, useRef, useState } from "react";
import { juntarClasses } from "@/lib/classes";

// === Seção: Tipos ===
type ItemIndice = {
  id: string;
  numero: string;
  titulo: string;
};

// === Seção: Índice dos Termos ===
// Cartão lateral no desktop e barra de abas no celular; destaca a seção que está sendo lida.
export default function IndiceTermos({ itens }: { itens: ItemIndice[] }) {
  const referenciaLista = useRef<HTMLOListElement>(null);
  const [idAtivo, setIdAtivo] = useState(itens[0]?.id);

  // Observa as seções: a ativa é a que passa pela faixa de cima da tela
  useEffect(() => {
    const secoes = itens
      .map((item) => document.getElementById(item.id))
      .filter((secao): secao is HTMLElement => secao !== null);

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((entrada) => entrada.isIntersecting);
        if (visivel) setIdAtivo(visivel.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    secoes.forEach((secao) => observador.observe(secao));
    return () => observador.disconnect();
  }, [itens]);

  // Na barra de abas (quando ela rola na horizontal), centraliza a aba ativa
  useEffect(() => {
    const lista = referenciaLista.current;
    const aba = lista?.querySelector<HTMLElement>(".indiceTermos__itemAtivo");
    if (!lista || !aba || lista.scrollWidth <= lista.clientWidth) return;
    lista.scrollTo({ left: aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2, behavior: "smooth" });
  }, [idAtivo]);

  return (
    <nav className="indiceTermos" aria-label="Seções dos termos">
      <ol className="indiceTermos__lista" ref={referenciaLista}>
        {itens.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={juntarClasses("indiceTermos__item", item.id === idAtivo && "indiceTermos__itemAtivo")}
              aria-current={item.id === idAtivo ? "location" : undefined}
            >
              <span className="indiceTermos__numero">{item.numero}</span>
              <span className="indiceTermos__titulo">{item.titulo}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
