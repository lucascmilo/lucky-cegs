"use client";

import { useEffect, useRef } from "react";
import { FotosDoItem } from "./FotoItem";
import { IconeFechar } from "./Icones";
import "@/estilos/componentes/JanelaConfirmar.css";

type PropsJanelaFotos = {
  item: { nome: string; fotoId: string | null; proofWhId: string | null };
  aoFechar: () => void;
};

// === Seção: Fotos do item (abre pela câmera nas tabelas da GOM) ===
// Foto do item e proof da warehouse lado a lado. Fecha no X, no Esc ou clicando fora.
export default function JanelaFotos({ item, aoFechar }: PropsJanelaFotos) {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  return (
    <dialog
      ref={referencia}
      className="janelaConfirmar janelaFotos"
      aria-label={`Fotos de ${item.nome}`}
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) evento.currentTarget.close();
      }}
    >
      <div className="janelaConfirmar__conteudo">
        <div className="janelaFotos__topo">
          <h2 className="janelaConfirmar__titulo">{item.nome}</h2>
          <button
            type="button"
            className="janelaFotos__fechar"
            onClick={() => referencia.current?.close()}
            aria-label="Fechar fotos"
          >
            <IconeFechar aria-hidden="true" />
          </button>
        </div>
        <FotosDoItem
          item={item}
          className="janelaFotos__fotos"
          classeFoto="janelaFotos__foto"
        />
      </div>
    </dialog>
  );
}

// A câmera só abre as fotos quando o item tem pelo menos uma
export function temFoto(item: { fotoId: string | null; proofWhId: string | null }) {
  return Boolean(item.fotoId || item.proofWhId);
}