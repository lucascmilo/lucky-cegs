"use client";

import { CldImage } from "next-cloudinary";
import { type DragEvent, type ReactNode, useId, useState, useTransition } from "react";
import { IconeEnviar, IconeLixeira, IconeMais, IconeMenos } from "@/componentes/Icones";
import { juntarClasses } from "@/lib/classes";
import { conferirFoto, enviarFoto } from "@/lib/envioFoto";

// Peças de formulário das janelas da GOM (item, caixa e aviso)

// === Seção: Campo com rótulo, ajuda e erro ===
type PropsCampo = {
  rotulo: string;
  id: string;
  erro?: string;
  ajuda?: string;
  children: ReactNode;
};

export function Campo({ rotulo, id, erro, ajuda, children }: PropsCampo) {
  return (
    <div className="janelaGom__campo">
      <label htmlFor={id} className="janelaGom__rotulo">
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="janelaGom__erro">
          {erro}
        </p>
      ) : (
        ajuda && <p className="janelaGom__ajuda">{ajuda}</p>
      )}
    </div>
  );
}

type PropsEntradaReais = {
  id: string;
  valor: string;
  aoMudar: (valor: string) => void;
  alta?: boolean;
  compacto?: boolean;
  rotulo?: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  "data-erro": string;
};

export function EntradaReais({
  valor,
  aoMudar,
  alta,
  compacto,
  rotulo,
  ...resto
}: PropsEntradaReais) {
  return (
    <span
      className={juntarClasses("janelaGom__reais", compacto && "janelaGom__reaisCompacto")}
    >
      <span className="janelaGom__simbolo" aria-hidden="true">
        R$
      </span>
      <input
        {...resto}
        className={juntarClasses(
          "janelaGom__entrada janelaGom__entradaReais",
          alta && "janelaGom__entradaAlta",
          compacto && "janelaGom__entradaLinha",
        )}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        aria-label={rotulo}
        inputMode="decimal"
        placeholder="0,00"
        autoComplete="off"
      />
    </span>
  );
}

// === Seção: Contador com − e + ===
// "compacto" é a versão pequena, ao lado do nome da categoria (quanto fica com cada joiner do set)
type PropsContador = {
  id: string;
  rotulo: string;
  // No contador compacto aparece a sigla (PC, POST…); o nome inteiro fica para o leitor de tela
  sigla?: string;
  valor: number;
  aoMudar: (valor: number) => void;
  compacto?: boolean;
};

export function Contador({ id, rotulo, sigla, valor, aoMudar, compacto }: PropsContador) {
  const mudar = (novo: number) => aoMudar(Math.min(999, Math.max(0, novo)));
  return (
    <div
      className={juntarClasses(
        "janelaGom__contadorCampo",
        compacto && "janelaGom__contadorCompacto",
      )}
    >
      <label
        htmlFor={id}
        className="janelaGom__rotuloPequeno"
        title={sigla ? rotulo : undefined}
      >
        {sigla ?? rotulo}
        {sigla && <span className="somenteLeitorTela"> ({rotulo})</span>}
      </label>
      <div className="janelaGom__contador">
        <button
          type="button"
          className="janelaGom__passo"
          onClick={() => mudar(valor - 1)}
          disabled={valor === 0}
          aria-label={`Menos ${rotulo}`}
        >
          <IconeMenos aria-hidden="true" />
        </button>
        <input
          id={id}
          className="janelaGom__numero"
          value={valor}
          onChange={(evento) =>
            mudar(Number(evento.target.value.replace(/\D/g, "")) || 0)
          }
          onFocus={(evento) => evento.target.select()}
          inputMode="numeric"
          autoComplete="off"
        />
        <button
          type="button"
          className="janelaGom__passo"
          onClick={() => mudar(valor + 1)}
          disabled={valor === 999}
          aria-label={`Mais ${rotulo}`}
        >
          <IconeMais aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// === Seção: Espaço para soltar a foto ===
type PropsCampoFoto = {
  rotulo: string;
  pasta: string;
  fotoId: string | null;
  aoMudar: (id: string | null) => void;
};

export function CampoFoto({ rotulo, pasta, fotoId, aoMudar }: PropsCampoFoto) {
  const idSeletor = useId();
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    const problema = conferirFoto(arquivo);
    if (problema) return setErro(problema);
    setErro(null);
    iniciar(async () => {
      try {
        aoMudar(await enviarFoto(arquivo, pasta));
      } catch (falha) {
        setErro(
          falha instanceof Error
            ? falha.message
            : "A foto não subiu. Tente de novo.",
        );
      }
    });
  }

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    enviar(evento.dataTransfer.files[0]);
  }

  const escolher = () => document.getElementById(idSeletor)?.click();

  return (
    <div className="janelaGom__campo">
      <span className="janelaGom__rotulo" id={`${idSeletor}-rotulo`}>
        {rotulo}
      </span>
      <div
        className={juntarClasses(
          "janelaGom__soltar",
          arrastando && "janelaGom__soltarArrastando",
        )}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
        aria-busy={enviando}
      >
        {fotoId ? (
          <>
            <CldImage
              src={fotoId}
              alt={rotulo}
              width={120}
              height={120}
              crop="fill"
              className="janelaGom__miniatura"
            />
            <span className="janelaGom__textoFoto">
              <strong>{enviando ? "Enviando…" : "Foto pronta"}</strong>
              <span>Arraste outra para trocar</span>
            </span>
            <span className="janelaGom__acoesFoto">
              <button
                type="button"
                className="janelaGom__botaoFoto"
                onClick={escolher}
                disabled={enviando}
              >
                Trocar
              </button>
              <button
                type="button"
                className="janelaGom__botaoFoto"
                onClick={() => aoMudar(null)}
                disabled={enviando}
                aria-label={`Tirar ${rotulo.toLowerCase()}`}
              >
                <IconeLixeira aria-hidden="true" />
              </button>
            </span>
          </>
        ) : (
          <button
            type="button"
            className="janelaGom__escolherFoto"
            onClick={escolher}
            disabled={enviando}
            aria-describedby={`${idSeletor}-rotulo`}
          >
            <IconeEnviar tamanho={22} aria-hidden="true" />
            <span className="janelaGom__textoFoto">
              <strong>{enviando ? "Enviando…" : "Solte a foto aqui"}</strong>
              <span>ou toque para escolher</span>
            </span>
          </button>
        )}
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
      </div>
      {erro && (
        <p className="janelaGom__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}