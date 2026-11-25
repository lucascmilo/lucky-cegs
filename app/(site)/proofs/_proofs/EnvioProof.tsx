"use client";

import { type DragEvent, type ReactNode, useId, useState, useTransition } from "react";
import { IconeEnviar } from "@/componentes/Icones";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import { juntarClasses } from "@/lib/classes";
import { chamar } from "@/lib/conexao";
import { conferirFoto, enviarFoto } from "@/lib/envioFoto";
import { removerProof, salvarProof } from "../acoes";

const PASTA = "proofs";

type Joiner = { caixaId: number; userId: string };

// Confere o arquivo, envia e liga a foto ao joiner
function useEnvioProof({ caixaId, userId }: Joiner) {
  const [enviando, iniciarEnvio] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    const problema = conferirFoto(arquivo);
    if (problema) return setErro(problema);

    setErro(null);
    iniciarEnvio(async () => {
      try {
        const resultado = await salvarProof(caixaId, userId, await enviarFoto(arquivo, PASTA));
        if (!resultado.ok) setErro(resultado.erro);
      } catch (falha) {
        setErro(
          falha instanceof Error ? falha.message : "A foto não subiu. Tente de novo.",
        );
      }
    });
  }

  return { enviar, enviando, erro };
}

// Área que aceita soltar a foto, com o seletor de arquivo escondido
function AreaSoltar({
  joiner,
  className,
  children,
}: {
  joiner: Joiner;
  className: string;
  children: (opcoes: { escolher: () => void; enviando: boolean }) => ReactNode;
}) {
  const { enviar, enviando, erro } = useEnvioProof(joiner);
  const [arrastando, setArrastando] = useState(false);
  const idSeletor = useId();

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    enviar(evento.dataTransfer.files[0]);
  }

  return (
    <div
      className={juntarClasses(
        className,
        arrastando && "envioProof__arrastando",
        enviando && "envioProof__enviando",
      )}
      onDragOver={(evento) => {
        evento.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={soltar}
      aria-busy={enviando}
    >
      {children({
        escolher: () => document.getElementById(idSeletor)?.click(),
        enviando,
      })}
      <input
        id={idSeletor}
        type="file"
        accept="image/*"
        hidden
        onChange={(evento) => {
          enviar(evento.target.files?.[0]);
          evento.target.value = "";
        }}
      />
      {erro && (
        <p className="envioProof__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

// === Seção: Barra "Subir proof geral" ===
export function BarraEnvio({ joiner, nome }: { joiner: Joiner; nome: string }) {
  return (
    <AreaSoltar joiner={joiner} className="envioProof">
      {({ escolher, enviando }) => (
        <>
          <IconeEnviar className="envioProof__icone" aria-hidden="true" />
          <div className="envioProof__textos">
            <p className="envioProof__titulo">Subir proof geral de {nome}</p>
            <p className="envioProof__dica">
              Uma foto com todos os itens desse joiner desta caixa. Arraste ou toque para
              escolher.
            </p>
          </div>
          <button
            type="button"
            className="envioProof__botao"
            onClick={escolher}
            disabled={enviando}
          >
            {enviando ? "Enviando…" : "Escolher foto"}
          </button>
        </>
      )}
    </AreaSoltar>
  );
}

// === Seção: Espaço da foto no cartão-postal (sem foto ainda) ===
export function FotoParaSoltar({ joiner }: { joiner: Joiner }) {
  return (
    <AreaSoltar joiner={joiner} className="envioProof__foto">
      {({ escolher, enviando }) => (
        <button
          type="button"
          className="envioProof__fotoBotao"
          onClick={escolher}
          disabled={enviando}
        >
          <IconeEnviar tamanho={26} aria-hidden="true" />
          <span className="envioProof__fotoTitulo">
            {enviando ? "ENVIANDO…" : "SOLTE A FOTO AQUI"}
          </span>
          <span>ou toque para escolher</span>
        </button>
      )}
    </AreaSoltar>
  );
}

// === Seção: "Trocar foto" e "Remover" ===
export function AcoesProof({ joiner, user }: { joiner: Joiner; user: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erroRemover, setErroRemover] = useState<string | null>(null);
  const [removendo, iniciarRemocao] = useTransition();

  return (
    <AreaSoltar joiner={joiner} className="acoesProof">
      {({ escolher, enviando }) => (
        <>
          <button
            type="button"
            className="acoesProof__botao"
            onClick={escolher}
            disabled={enviando}
          >
            <IconeEnviar tamanho={16} aria-hidden="true" />
            {enviando ? "Enviando…" : "Trocar foto"}
          </button>
          <button
            type="button"
            className="acoesProof__botao"
            onClick={() => {
              setErroRemover(null);
              setConfirmando(true);
            }}
            disabled={enviando}
          >
            Remover
          </button>

          {confirmando && (
            <JanelaConfirmar
              titulo="Remover esta proof?"
              rotuloConfirmar="Remover"
              tom="perigo"
              enviando={removendo}
              erro={erroRemover}
              aoCancelar={() => setConfirmando(false)}
              aoConfirmar={() =>
                iniciarRemocao(async () => {
                  const resultado = await chamar(() =>
                    removerProof(joiner.caixaId, joiner.userId),
                  );
                  if (resultado.ok) setConfirmando(false);
                  else setErroRemover(resultado.erro);
                })
              }
            >
              <p>
                A foto sai do fichário de <strong>@{user}</strong> e é apagada. Não dá para
                desfazer.
              </p>
            </JanelaConfirmar>
          )}
        </>
      )}
    </AreaSoltar>
  );
}