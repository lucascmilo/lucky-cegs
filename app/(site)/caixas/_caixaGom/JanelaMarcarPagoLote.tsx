"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import { IconeFechar } from "@/componentes/Icones";
import { chamar } from "@/lib/conexao";
import type { JoinerOpcao } from "@/lib/planilhaCaixa";
import { marcarFreteTaxaPagoJoiner } from "../acoesCaixa";
import { Campo } from "./CamposJanela";
import "@/estilos/componentes/JanelaGom.css";

type PropsJanelaMarcarPagoLote = {
  caixaId: number;
  nomeCaixa: string;
  joiners: JoinerOpcao[];
  joinersDaCaixa?: string[];
  aoFechar: () => void;
};

// === Seção: Janela "Dar baixa em pagamentos" ===
// Marca frete inter e/ou taxa já lançados como pagos para um joiner nesta caixa.
// Fecha assim que a ação é concluída.
export default function JanelaMarcarPagoLote({
  caixaId,
  nomeCaixa,
  joiners,
  joinersDaCaixa = [],
  aoFechar,
}: PropsJanelaMarcarPagoLote) {
  const referencia = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const jaFechou = useRef(false);

  const opcoesJoiner = joiners.filter((j) =>
    joinersDaCaixa.length > 0 ? joinersDaCaixa.includes(j.user) : true,
  );

  const [joinerUserId, setJoinerUserId] = useState(opcoesJoiner[0]?.id ?? "");
  const [marcarInter, setMarcarInter] = useState(true);
  const [marcarTaxa, setMarcarTaxa] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

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
        marcarFreteTaxaPagoJoiner(caixaId, joinerUserId, {
          inter: marcarInter,
          taxa: marcarTaxa,
        }),
      );
      if (!resultado.ok) {
        return setErro(resultado.erro);
      }
      mostrarAviso(
        `Pagamentos atualizados (${resultado.atualizadas} ${
          resultado.atualizadas === 1 ? "parte" : "partes"
        }) na ${nomeCaixa}.`,
      );
      fechar();
    });
  }

  return (
    <dialog
      ref={referencia}
      className="janelaGom"
      aria-labelledby="titulo-janela-marcar-pago-lote"
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
          <h2 id="titulo-janela-marcar-pago-lote" className="janelaGom__titulo">
            DAR BAIXA EM PAGAMENTOS
          </h2>
          <button
            type="button"
            className="janelaGom__fechar"
            onClick={fechar}
            disabled={salvando}
            aria-label="Fechar janela de dar baixa em pagamentos"
          >
            <IconeFechar tamanho={22} aria-hidden="true" />
          </button>
        </div>

        {opcoesJoiner.length === 0 ? (
          <p className="janelaGom__ajuda janelaGom__linha">
            Nenhum joiner com itens nesta caixa.
          </p>
        ) : (
          <div className="janelaGom__linha janelaGom__tres">
            <Campo rotulo="Joiner" id="lote-joiner">
              <select
                id="lote-joiner"
                className="seletorGom janelaGom__entrada"
                value={joinerUserId}
                onChange={(evento) => {
                  setJoinerUserId(evento.target.value);
                  setErro(null);
                }}
                disabled={salvando}
              >
                {opcoesJoiner.map((joiner) => (
                  <option key={joiner.id} value={joiner.id}>
                    @{joiner.user} ({joiner.nome})
                  </option>
                ))}
              </select>
            </Campo>

            <div className="janelaGom__campo">
              <span className="janelaGom__rotulo">O que marcar como pago</span>
              <div className="janelaGom__valorPago janelaGom__opcoesPagamento">
                <label className="janelaGom__ficaComRotulo janelaGom__opcaoCheck">
                  <input
                    type="checkbox"
                    className="janelaGom__pago"
                    checked={marcarInter}
                    onChange={(evento) => {
                      setMarcarInter(evento.target.checked);
                      setErro(null);
                    }}
                    disabled={salvando}
                  />
                  <span>Inter</span>
                </label>
                <label className="janelaGom__ficaComRotulo janelaGom__opcaoCheck">
                  <input
                    type="checkbox"
                    className="janelaGom__pago"
                    checked={marcarTaxa}
                    onChange={(evento) => {
                      setMarcarTaxa(evento.target.checked);
                      setErro(null);
                    }}
                    disabled={salvando}
                  />
                  <span>Taxa</span>
                </label>
              </div>
            </div>
          </div>
        )}

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
          {opcoesJoiner.length > 0 && (
            <button
              type="submit"
              className="botao botao__rosa janelaGom__botao janelaGom__botaoSalvar"
              disabled={salvando || !joinerUserId}
            >
              {salvando ? "Salvando…" : "Marcar como pago"}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}