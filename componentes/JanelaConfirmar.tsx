"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconeCoracao, IconeLixeira } from "@/componentes/Icones";
import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/JanelaConfirmar.css";

type PropsJanelaConfirmar = {
  titulo: string;
  children: ReactNode;
  rotuloConfirmar: string;
  // "perigo" apaga algo (selo e botão vermelhos); "acao" confirma uma entrega
  tom?: "acao" | "perigo";
  enviando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

const DURACAO_FECHAR = 160;

// === Seção: Janela de confirmação (cartão-postal) ===
// Para ações que não dá para desfazer. Fecha no "Cancelar", no Esc ou clicando fora.
// O foco começa no "Cancelar", a escolha segura.
export default function JanelaConfirmar({
  titulo,
  children,
  rotuloConfirmar,
  tom = "acao",
  enviando,
  erro,
  aoConfirmar,
  aoCancelar,
}: PropsJanelaConfirmar) {
  const referencia = useRef<HTMLDialogElement>(null);
  const [fechando, setFechando] = useState(false);

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  function cancelar() {
    if (enviando || fechando) return;
    setFechando(true);
    window.setTimeout(aoCancelar, DURACAO_FECHAR);
  }

  return (
    <dialog
      ref={referencia}
      className={juntarClasses("janelaConfirmar", fechando && "janelaConfirmar__fechando")}
      aria-labelledby="titulo-confirmar"
      onCancel={(evento) => {
        evento.preventDefault();
        cancelar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) cancelar();
      }}
    >
      <div className="janelaConfirmar__conteudo">
        <div className="janelaConfirmar__topo">
          <span className={juntarClasses("janelaConfirmar__selo", tom === "perigo" && "janelaConfirmar__seloPerigo")}>
            {tom === "perigo" ? <IconeLixeira tamanho={22} /> : <IconeCoracao tamanho={20} />}
          </span>
          <h2 id="titulo-confirmar" className="janelaConfirmar__titulo">
            {titulo}
          </h2>
        </div>

        <div className="janelaConfirmar__texto">{children}</div>

        {erro && (
          <p className="janelaConfirmar__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="janelaConfirmar__botoes">
          <button type="button" className="botao botao__contorno" onClick={cancelar} disabled={enviando}>
            Cancelar
          </button>
          <button
            type="button"
            className={juntarClasses("botao", tom === "perigo" ? "janelaConfirmar__botaoPerigo" : "botao__preto")}
            onClick={aoConfirmar}
            disabled={enviando}
          >
            {enviando ? "Salvando…" : rotuloConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
