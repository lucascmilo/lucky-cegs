"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { enderecoEntrar } from "@/lib/navegacao";
import { pedirItemSemDono } from "../acoes";
import { chamar } from "@/lib/conexao";

type PropsBotaoQueroEsse = {
  registroId: number;
  logado: boolean;
  pedidoEnviado: boolean;
};

// === Seção: Botão "Quero esse" ===
// Sem login leva para Entrar (e volta para cá). Depois do pedido vira "Pedido enviado", sem clique.
export default function BotaoQueroEsse({ registroId, logado, pedidoEnviado }: PropsBotaoQueroEsse) {
  const [enviando, iniciarEnvio] = useTransition();
  const [enviado, setEnviado] = useState(pedidoEnviado);
  const [erro, setErro] = useState<string | null>(null);

  if (!logado) {
    return (
      <Link href={enderecoEntrar("/sem-dono")} className="botaoQueroEsse">
        Quero esse
      </Link>
    );
  }

  if (enviado) {
    return (
      <span className="botaoQueroEsse botaoQueroEsse__enviado" role="status">
        Pedido enviado
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="botaoQueroEsse"
        disabled={enviando}
        onClick={() =>
          iniciarEnvio(async () => {
            setErro(null);
            const resultado = await chamar(() => pedirItemSemDono(registroId));
            if (resultado.ok) setEnviado(true);
            else setErro(resultado.erro);
          })
        }
      >
        {enviando ? "Enviando…" : "Quero esse"}
      </button>
      {erro && (
        <p className="botaoQueroEsse__erro" role="alert">
          {erro}
        </p>
      )}
    </>
  );
}
