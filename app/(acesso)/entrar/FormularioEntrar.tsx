"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { limparUser, traduzirErroAutenticacao } from "@/lib/mensagensErro";
import "@/estilos/paginas/acesso/Formulario.css";

// === Seção: Formulário de login ===
export default function FormularioEntrar() {
  const roteador = useRouter();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);

    const userLimpo = limparUser(user);
    if (!userLimpo || !senha) {
      setErro("Preencha seu user e sua senha.");
      return;
    }

    setEnviando(true);
    const { error: falha } = await authClient.signIn.username({ username: userLimpo, password: senha });

    if (falha) {
      setErro(traduzirErroAutenticacao(falha.code, "entrar"));
      setEnviando(false);
      return;
    }

    roteador.push("/");
    roteador.refresh();
  }

  return (
    <form className="formulario formulario__formularioEntrar" onSubmit={enviarFormulario} noValidate>
      {/* === Seção: Campos === */}
      <div className="formulario__grade formulario__gradeUmaColuna">
        <label className="formulario__campo">
          <span className="formulario__rotulo">Seu user</span>
          <input
            className="formulario__entrada"
            name="user"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Seu user no twitter"
            value={user}
            onChange={(evento) => setUser(evento.target.value)}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__rotulo">Senha</span>
          <input
            className="formulario__entrada"
            type="password"
            name="senha"
            autoComplete="current-password"
            placeholder="Mínimo de 8 caracteres"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </label>
      </div>

      {/* === Seção: Erro === */}
      {erro && (
        <p className="formulario__mensagemErro" role="alert">
          {erro}
        </p>
      )}

      {/* === Seção: Ações === */}
      <button type="submit" className="formulario__botaoPrincipal" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <hr className="formulario__divisoria" />

      <p className="formulario__alternarConta">
        Ainda não tem uma conta? <Link href="/criar-conta">Criar conta</Link>
      </p>
    </form>
  );
}
