"use client";

import { useId, useState, useTransition } from "react";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import JanelaSenhaProvisoria from "@/componentes/JanelaSenhaProvisoria";
import { type ResultadoConta, criarContaJoiner, redefinirSenhaJoiner } from "@/lib/acoesContas";
import { chamar } from "@/lib/conexao";
import type { JoinerOpcao } from "@/lib/planilhaCaixa";

// === Seção: Contas dos joiners (GOM) ===
// Um campo de @ só: se a conta existe, redefine a senha; se não existe, cria.
export default function ContasJoiners({ joiners }: { joiners: JoinerOpcao[] }) {
  const idLista = useId();
  const [texto, setTexto] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState<Extract<ResultadoConta, { ok: true }> | null>(null);
  const [enviando, iniciar] = useTransition();

  const user = texto.trim().replace(/^@/, "").toLowerCase();
  const existente = joiners.find((joiner) => joiner.user === user);

  function executar(acao: (texto: string) => Promise<ResultadoConta>) {
    setErro(null);
    iniciar(async () => {
      const resultado = await chamar(() => acao(user));
      setConfirmando(false);
      if (!resultado.ok) return setErro(resultado.erro);
      setPronto(resultado);
      setTexto("");
    });
  }

  return (
    <div className="contasJoiners">
      <p className="contasJoiners__texto">
        Joiner esqueceu a senha ou ainda não tem conta? Digite o @: a senha provisória sai pronta
        para mandar, e o joiner troca em Meu perfil depois de entrar.
      </p>

      <form
        className="contasJoiners__linha"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (!user) return setErro("Digite o @ do joiner.");
          if (existente) setConfirmando(true);
          else executar(criarContaJoiner);
        }}
      >
        <label htmlFor="conta-joiner" className="somenteLeitorTela">
          User do joiner
        </label>
        <input
          id="conta-joiner"
          className="contasJoiners__campo"
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            setErro(null);
          }}
          list={idLista}
          placeholder="@user do twitter…"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "conta-joiner-erro" : undefined}
        />
        <datalist id={idLista}>
          {joiners.map((joiner) => (
            <option key={joiner.id} value={`@${joiner.user}`}>
              {joiner.nome}
            </option>
          ))}
        </datalist>
        <button
          type="submit"
          className="botao botao__preto contasJoiners__botao"
          disabled={enviando || !user}
        >
          {enviando
            ? "Aguarde…"
            : !user
              ? "Redefinir ou criar"
              : existente
                ? "Redefinir senha"
                : "Criar conta"}
        </button>
      </form>

      {erro && (
        <p id="conta-joiner-erro" className="contasJoiners__erro" role="alert">
          {erro}
        </p>
      )}

      {confirmando && existente && (
        <JanelaConfirmar
          titulo="Redefinir esta senha?"
          rotuloConfirmar="Redefinir senha"
          enviando={enviando}
          erro={null}
          aoCancelar={() => setConfirmando(false)}
          aoConfirmar={() => executar(redefinirSenhaJoiner)}
        >
          <p>
            A senha atual de <strong>@{existente.user}</strong> para de funcionar e a conta sai de
            todos os aparelhos.
          </p>
          <p>Você recebe uma senha provisória para mandar.</p>
        </JanelaConfirmar>
      )}

      {pronto && <JanelaSenhaProvisoria {...pronto} aoFechar={() => setPronto(null)} />}
    </div>
  );
}