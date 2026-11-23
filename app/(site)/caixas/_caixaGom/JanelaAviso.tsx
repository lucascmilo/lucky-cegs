"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { mostrarAviso } from "@/componentes/AvisoFlutuante";
import { IconeFechar, IconeMegafone } from "@/componentes/Icones";
import { juntarClasses } from "@/lib/classes";
import { TAMANHO_MAXIMO_AVISO } from "@/lib/configuracoes";
import { postarAviso } from "../acoes";
import "@/estilos/componentes/JanelaGom.css";

// Começos prontos: um toque preenche a mensagem
const SUGESTOES = [
  "Lembrete: confira em Meus itens o que ainda falta pagar.",
  "O prazo de pagamento desta caixa termina em breve.",
  "Atualização da caixa: ",
];

type PropsJanelaAviso = {
  caixaId: number;
  nomeCaixa: string;
  // Users dos joiners com itens nesta caixa
  joiners: string[];
  aoFechar: () => void;
};

// === Seção: Janela "Aviso da caixa" ===
// O aviso chega no sino de todos os joiners da caixa ou de um só, e leva para a página da caixa.
export default function JanelaAviso({ caixaId, nomeCaixa, joiners, aoFechar }: PropsJanelaAviso) {
  const referencia = useRef<HTMLDialogElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const [para, setPara] = useState<"todos" | "um">("todos");
  const [joiner, setJoiner] = useState(joiners[0] ?? "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  useEffect(() => {
    referencia.current?.showModal();
  }, []);

  const texto = mensagem.trim();
  const restante = TAMANHO_MAXIMO_AVISO - mensagem.length;
  const quantos = para === "todos" ? joiners.length : 1;

  function usarSugestao(sugestao: string) {
    setMensagem(sugestao);
    setErro(null);
    // O cursor vai para o fim, pronto para completar
    requestAnimationFrame(() => {
      const area = campo.current;
      area?.focus();
      area?.setSelectionRange(sugestao.length, sugestao.length);
    });
  }

  function enviar() {
    if (texto.length < 3) return setErro("Escreva o aviso.");
    setErro(null);
    iniciar(async () => {
      const resultado = await postarAviso(caixaId, texto, para === "todos" ? "todos" : joiner);
      if (!resultado.ok) return setErro(resultado.erro);
      mostrarAviso(
        resultado.enviados === 1 ? "Aviso enviado para 1 joiner." : `Aviso enviado para ${resultado.enviados} joiners.`,
      );
      referencia.current?.close();
    });
  }

  return (
    <dialog
      ref={referencia}
      className="janelaGom janelaAviso"
      aria-labelledby="titulo-janela-aviso"
      onClose={aoFechar}
      onCancel={(evento) => {
        if (enviando) evento.preventDefault();
      }}
    >
      <form
        className="janelaGom__conteudo"
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar();
        }}
      >
        <div className="janelaGom__topo">
          <h2 id="titulo-janela-aviso" className="janelaGom__titulo">
            AVISO DA CAIXA
          </h2>
          <button
            type="button"
            className="janelaGom__fechar"
            onClick={() => referencia.current?.close()}
            disabled={enviando}
            aria-label="Fechar sem enviar"
          >
            <IconeFechar tamanho={22} />
          </button>
        </div>

        {joiners.length === 0 ? (
          <p className="janelaAviso__vazio">
            A {nomeCaixa} ainda não tem joiners. Quando um item tiver dono, o aviso pode ser enviado.
          </p>
        ) : (
          <>
            {/* === Seção: Para quem === */}
            <fieldset className="janelaGom__linha janelaGom__grupoCampos">
              <legend className="janelaGom__rotulo">Para</legend>
              <div className="janelaAviso__para">
                {(
                  [
                    ["todos", `Todos os joiners (${joiners.length})`],
                    ["um", "Um joiner"],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <label
                    key={valor}
                    className={juntarClasses("janelaCaixa__origem", para === valor && "janelaCaixa__origemAtiva")}
                  >
                    <input
                      type="radio"
                      name="para"
                      value={valor}
                      checked={para === valor}
                      onChange={() => setPara(valor)}
                      className="somenteLeitorTela"
                    />
                    {rotulo}
                  </label>
                ))}
                {para === "um" && (
                  <>
                    <label htmlFor="aviso-joiner" className="somenteLeitorTela">
                      Joiner
                    </label>
                    <select
                      id="aviso-joiner"
                      className="seletorGom janelaGom__entrada janelaAviso__joiner"
                      value={joiner}
                      onChange={(evento) => setJoiner(evento.target.value)}
                    >
                      {joiners.map((user) => (
                        <option key={user} value={user}>
                          @{user}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </fieldset>

            {/* === Seção: Mensagem === */}
            <div className="janelaGom__linha janelaGom__campo">
              <label htmlFor="aviso-mensagem" className="janelaGom__rotulo">
                Mensagem
              </label>
              <div className="janelaAviso__sugestoes" role="group" aria-label="Começos prontos">
                {SUGESTOES.map((sugestao) => (
                  <button key={sugestao} type="button" className="janelaAviso__sugestao" onClick={() => usarSugestao(sugestao)}>
                    {sugestao.trim().replace(/:$/, "…")}
                  </button>
                ))}
              </div>
              <textarea
                ref={campo}
                id="aviso-mensagem"
                className="janelaGom__entrada janelaAviso__mensagem"
                value={mensagem}
                onChange={(evento) => {
                  setMensagem(evento.target.value);
                  setErro(null);
                }}
                maxLength={TAMANHO_MAXIMO_AVISO}
                placeholder="Ex.: A caixa saiu da warehouse hoje! Os fretes chegam semana que vem…"
                aria-invalid={Boolean(erro)}
                aria-describedby="aviso-contador"
              />
              <p id="aviso-contador" className={juntarClasses("janelaGom__ajuda", restante < 20 && "janelaAviso__quaseCheio")}>
                {restante} {restante === 1 ? "caractere restante" : "caracteres restantes"}
              </p>
            </div>

            {/* === Seção: Como chega no sino === */}
            <div className="janelaAviso__previa" aria-hidden="true">
              <span className="janelaAviso__previaRotulo">Assim chega no sino</span>
              <span className="janelaAviso__notificacao">
                <span className="janelaAviso__icone">
                  <IconeMegafone tamanho={14} />
                </span>
                <span className="janelaAviso__textoNotificacao">
                  <strong>
                    Aviso da {nomeCaixa}: {texto || "sua mensagem aparece aqui."}
                  </strong>
                  <span>agora</span>
                </span>
              </span>
            </div>
          </>
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
            onClick={() => referencia.current?.close()}
            disabled={enviando}
          >
            Cancelar
          </button>
          {joiners.length > 0 && (
            <button type="submit" className="botao botao__rosa janelaGom__botao janelaAviso__enviar" disabled={enviando}>
              {enviando ? "Enviando…" : quantos === 1 ? "Enviar para 1 joiner" : `Enviar para ${quantos} joiners`}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
