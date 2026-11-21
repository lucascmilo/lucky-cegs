"use client";

import { useState, type InputHTMLAttributes } from "react";
import { IconeOlho } from "@/componentes/Icones";
import { juntarClasses } from "@/lib/classes";

// === Seção: Campo de senha com botão de mostrar/ocultar ===
export default function EntradaSenha({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visivel, setVisivel] = useState(false);

  return (
    <span className="formulario__envoltorioSenha">
      <input {...props} type={visivel ? "text" : "password"} className={juntarClasses(className, "formulario__entradaSenha")} />
      <button
        type="button"
        className="formulario__botaoOlho"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
      >
        <IconeOlho riscado={visivel} />
      </button>
    </span>
  );
}
