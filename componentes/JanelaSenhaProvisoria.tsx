"use client";

import { useEffect, useRef } from "react";
import BotaoCopiar from "./BotaoCopiar";
import { IconeCheck } from "./Icones";
import "@/estilos/componentes/JanelaConfirmar.css";

type PropsJanelaSenhaProvisoria = {
  user: string;
  senha: string;
  // true = conta nova; false = senha redefinida
  nova: boolean;
  aoFechar: () => void;
};

// === Seção: Senha provisória para a GOM mandar ao joiner ===
// A senha só aparece aqui, uma vez: a GOM copia a mensagem pronta e manda pelo grupo ou pela DM.
export default function JanelaSenhaProvisoria({ user, senha, nova, aoFechar }: PropsJanelaSenhaProvisoria) {
  const referencia = useRef<HTMLDialogElement>(null);
  const endereco = typeof window === "undefined" ? "" : `${window.location.origin}/entrar`;

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  const mensagem = [
    nova ? "Sua conta na Lucky Cegs foi criada!" : "Sua senha na Lucky Cegs foi redefinida.",
    `User: @${user}`,
    `Senha provisória: ${senha}`,
    `Entre em ${endereco} e troque a senha em Meu perfil.`,
  ].join("\n");

  return (
    <dialog
      ref={referencia}
      className="janelaConfirmar janelaSenha"
      aria-labelledby="titulo-senha-provisoria"
      onClose={aoFechar}
    >
      <div className="janelaConfirmar__conteudo">
        <div className="janelaConfirmar__topo">
          <span className="janelaConfirmar__selo" aria-hidden="true">
            <IconeCheck tamanho={18} />
          </span>
          <h2 id="titulo-senha-provisoria" className="janelaConfirmar__titulo">
            {nova ? "Conta criada" : "Senha redefinida"}
          </h2>
        </div>

        <div className="janelaConfirmar__texto">
          <p>
            Mande esta mensagem para <strong>@{user}</strong>. A senha só aparece agora.
          </p>
          <pre className="janelaSenha__mensagem">{mensagem}</pre>
        </div>

        <div className="janelaConfirmar__botoes">
          <BotaoCopiar texto={mensagem} variante="claro" className="janelaSenha__copiar" />
          <button type="button" className="botao botao__preto" onClick={() => referencia.current?.close()}>
            Pronto
          </button>
        </div>
      </div>
    </dialog>
  );
}
