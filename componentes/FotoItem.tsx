"use client";

import { CldImage } from "next-cloudinary";
import { useRef } from "react";
import { juntarClasses } from "@/lib/classes";
import { IconeFechar, IconeLupa } from "./Icones";
import "@/estilos/componentes/PecasItem.css";

type PropsFotoItem = {
  publicId: string | null;
  descricao: string;
  className?: string;
};

// === Seção: Foto do item com lupa ===
// A lupa abre a foto grande por cima da tela (fecha no X, no Esc ou clicando fora).
export default function FotoItem({ publicId, descricao, className }: PropsFotoItem) {
  const referenciaJanela = useRef<HTMLDialogElement>(null);

  if (!publicId) {
    return (
      <div className={juntarClasses("fotoItem fotoItem__vazia", className)}>
        <span className="fotoItem__semFoto">SEM FOTO AINDA</span>
      </div>
    );
  }

  return (
    <div className={juntarClasses("fotoItem", className)}>
      <CldImage
        src={publicId}
        alt={descricao}
        fill
        sizes="300px"
        className="fotoItem__imagem"
      />
      <button
        type="button"
        className="fotoItem__lupa"
        onClick={() => referenciaJanela.current?.showModal()}
        aria-label={`Ampliar: ${descricao}`}
      >
        <IconeLupa aria-hidden="true" />
      </button>

      {/* === Seção: Foto ampliada === */}
      <dialog
        ref={referenciaJanela}
        className="fotoItem__janela"
        aria-label={descricao}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) evento.currentTarget.close();
        }}
      >
        <CldImage
          src={publicId}
          alt={descricao}
          width={1200}
          height={900}
          sizes="90vw"
          className="fotoItem__ampliada"
        />
        <button
          type="button"
          className="fotoItem__fechar"
          onClick={() => referenciaJanela.current?.close()}
          aria-label="Fechar foto"
        >
          <IconeFechar aria-hidden="true" />
        </button>
      </dialog>
    </div>
  );
}

// === Seção: Foto do item e foto da balança ===
// Uma embaixo da outra; em telas estreitas ficam lado a lado
type PropsFotosDoItem = {
  item: { nome: string; fotoId: string | null; proofWhId: string | null };
  className: string;
  classeFoto: string;
};

export function FotosDoItem({ item, className, classeFoto }: PropsFotosDoItem) {
  return (
    <div className={juntarClasses("fotosDoItem", className)}>
      <FotoItem
        publicId={item.fotoId}
        descricao={`Foto de ${item.nome}`}
        className={classeFoto}
      />
      <FotoItem
        publicId={item.proofWhId}
        descricao={`Balança de ${item.nome}`}
        className={classeFoto}
      />
    </div>
  );
}