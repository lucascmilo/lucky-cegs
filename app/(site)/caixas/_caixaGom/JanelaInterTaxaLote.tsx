"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import { IconeFechar } from "@/componentes/Icones";
import { chamar } from "@/lib/conexao";
import {
  type CategoriaEmLote,
  aplicarInterTaxaCategoria,
} from "../acoesCaixa";
import { Campo, EntradaReais } from "./CamposJanela";
import "@/estilos/componentes/JanelaGom.css";

type PropsJanelaInterTaxaLote = {
  caixaId: number;
  nomeCaixa: string;
  aoFechar: () => void;
};

const OPCOES_CATEGORIA: { id: CategoriaEmLote; rotulo: string }[] = [
  { id: "photocards", rotulo: "Photocards" },
  { id: "postcards", rotulo: "Postcards" },
  { id: "smini", rotulo: "SMini" },
  { id: "itens", rotulo: "Itens" },
];

// === Seção: Janela "Inter e taxa em lote" ===
// Multiplica a quantidade da categoria escolhida pelo valor unitário (ex.: 6 PCs × R$ 1,50 = R$ 9,00).
// Álbuns continuam manuais. Fecha assim que a ação é concluída.
export default function JanelaInterTaxaLote({
  caixaId,
  nomeCaixa,
  aoFechar,
}: PropsJanelaInterTaxaLote) {
  const referencia = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const jaFechou = useRef(false);

  const [categoria, setCategoria] = useState<CategoriaEmLote>("photocards");
  const [inter, setInter] = useState("");
  const [taxa, setTaxa] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  useEffect(() => {
    if (!erro) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [erro]);

  function aoFecharJanela() {
    if (jaFechou.current) return;
    jaFechou.current = true;
    aoFechar();
  }

  function fechar() {
    referencia.current?.close();
    aoFecharJanela();
  }

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const resultado = await chamar(() =>
        aplicarInterTaxaCategoria(caixaId, categoria, { inter, taxa }),
      );
      if (!resultado.ok) {
        return setErro(resultado.erro);
      }
      mostrarAviso(
        `Inter/taxa lançados para ${resultado.atualizadas} ${
          resultado.atualizadas === 1 ? "parte" : "partes"
        } na ${nomeCaixa}.`,
      );
      fechar();
    });
  }

  return (
    <dialog
      ref={referencia}
      className="janelaGom"
      aria-labelledby="titulo-janela-inter-taxa-lote"
      onClose={aoFecharJanela}
      onCancel={(evento) => {
        if (salvando) evento.preventDefault();
      }}
    >
      <form
        ref={formulario}
        className="janelaGom__conteudo"
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          salvar();
        }}
      >
        <div className="janelaGom__topo">
          <h2 id="titulo-janela-inter-taxa-lote" className="janelaGom__titulo">
            INTER E TAXA EM LOTE
          </h2>
          <button
            type="button"
            className="janelaGom__fechar"
            onClick={fechar}
            disabled={salvando}
            aria-label="Fechar janela de inter e taxa em lote"
          >
            <IconeFechar tamanho={22} aria-hidden="true" />
          </button>
        </div>

        <div className="janelaGom__linha janelaGom__tres">
          <Campo rotulo="Categoria" id="lote-categoria">
            <select
              id="lote-categoria"
              className="seletorGom janelaGom__entrada"
              value={categoria}
              onChange={(evento) => {
                setCategoria(evento.target.value as CategoriaEmLote);
                setErro(null);
              }}
              disabled={salvando}
            >
              {OPCOES_CATEGORIA.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo rotulo="Frete inter por un." id="lote-inter">
            <EntradaReais
              id="lote-inter"
              valor={inter}
              aoMudar={(valor) => {
                setInter(valor);
                setErro(null);
              }}
              data-erro="inter"
              aria-invalid={Boolean(erro)}
            />
          </Campo>

          <Campo rotulo="Taxa por un." id="lote-taxa">
            <EntradaReais
              id="lote-taxa"
              valor={taxa}
              aoMudar={(valor) => {
                setTaxa(valor);
                setErro(null);
              }}
              data-erro="taxa"
              aria-invalid={Boolean(erro)}
            />
          </Campo>
        </div>

        {erro && (
          <p className="janelaGom__erroGeral" role="alert">
            {erro}
          </p>
        )}

        <div className="janelaGom__botoes">
          <button
            type="button"
            className="botao botao__contorno janelaGom__botao"
            onClick={fechar}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="botao botao__rosa janelaGom__botao janelaGom__botaoSalvar"
            disabled={salvando}
          >
            {salvando ? "Aplicando…" : "Aplicar na categoria"}
          </button>
        </div>
      </form>
    </dialog>
  );
}