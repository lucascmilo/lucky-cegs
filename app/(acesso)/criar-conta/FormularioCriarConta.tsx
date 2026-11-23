"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { DOMINIO_EMAIL_INTERNO, PADRAO_USER, TAMANHO_MINIMO_SENHA } from "@/lib/configuracoes";
import { limparUser, MENSAGEM_USER_INVALIDO, traduzirErroAutenticacao } from "@/lib/mensagensErro";
import { destinoDepoisDoLogin } from "@/lib/navegacao";
import EntradaSenha from "@/componentes/EntradaSenha";
import LinkAcesso from "../LinkAcesso";
import "@/estilos/paginas/acesso/Formulario.css";

// === Seção: Tipos ===
type CamposFormulario = {
  nome: string;
  user: string;
  senha: string;
  confirmarSenha: string;
};

type ErrosCampos = Partial<Record<keyof CamposFormulario | "termos", string>>;

// === Seção: Validação no navegador ===
function validarCampos(campos: CamposFormulario, aceitouTermos: boolean): ErrosCampos {
  const erros: ErrosCampos = {};
  const userLimpo = limparUser(campos.user);

  if (!campos.nome.trim()) erros.nome = "Informe seu nome.";
  if (!PADRAO_USER.test(userLimpo)) erros.user = MENSAGEM_USER_INVALIDO;
  if (campos.senha.length < TAMANHO_MINIMO_SENHA) erros.senha = `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres.`;
  if (campos.confirmarSenha !== campos.senha) erros.confirmarSenha = "As senhas não são iguais.";
  if (!aceitouTermos) erros.termos = "Para criar a conta, aceite os Termos da comunidade.";

  return erros;
}

// === Seção: Formulário de cadastro ===
export default function FormularioCriarConta() {
  const roteador = useRouter();
  const [campos, setCampos] = useState<CamposFormulario>({ nome: "", user: "", senha: "", confirmarSenha: "" });
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function atualizarCampo(nomeCampo: keyof CamposFormulario, valor: string) {
    setCampos((anteriores) => ({ ...anteriores, [nomeCampo]: valor }));
    setErrosCampos((anteriores) => ({ ...anteriores, [nomeCampo]: undefined }));
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const erros = validarCampos(campos, aceitouTermos);
    setErrosCampos(erros);
    if (Object.values(erros).some(Boolean)) return;

    setEnviando(true);
    const userLimpo = limparUser(campos.user);
    const { error: falha } = await authClient.signUp.email({
      name: campos.nome.trim(),
      username: userLimpo,
      email: `${userLimpo.toLowerCase()}@${DOMINIO_EMAIL_INTERNO}`,
      password: campos.senha,
    });

    if (falha) {
      setErroGeral(traduzirErroAutenticacao(falha.code, "criarConta"));
      setEnviando(false);
      return;
    }

    roteador.push(destinoDepoisDoLogin());
    roteador.refresh();
  }

  // === Seção: Renderização de um campo ===
  function renderizarCampo(
    nomeCampo: keyof CamposFormulario,
    rotulo: string,
    marcador: string,
    extras: { type?: string; autoComplete?: string } = {},
  ) {
    const mensagem = errosCampos[nomeCampo];
    const propsEntrada = {
      className: "formulario__entrada",
      name: nomeCampo,
      autoComplete: extras.autoComplete,
      placeholder: marcador,
      value: campos[nomeCampo],
      onChange: (evento: ChangeEvent<HTMLInputElement>) => atualizarCampo(nomeCampo, evento.target.value),
      "aria-invalid": mensagem ? true : undefined,
    };
    return (
      <label className="formulario__campo">
        <span className="formulario__rotulo">{rotulo}</span>
        {extras.type === "password" ? (
          <EntradaSenha {...propsEntrada} />
        ) : (
          <input
            {...propsEntrada}
            type={extras.type ?? "text"}
            autoCapitalize={nomeCampo === "user" ? "none" : undefined}
            spellCheck={nomeCampo === "user" ? false : undefined}
          />
        )}
        {mensagem && <span className="formulario__dica">{mensagem}</span>}
      </label>
    );
  }

  return (
    <form className="formulario" onSubmit={enviarFormulario} noValidate>
      {/* === Seção: Campos === */}
      <div className="formulario__grade">
        {renderizarCampo("nome", "Nome", "O nome que você usa no twitter", { autoComplete: "name" })}
        {renderizarCampo("user", "Seu user", "Seu user no twitter", { autoComplete: "username" })}
        {renderizarCampo("senha", "Senha", `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`, { type: "password", autoComplete: "new-password" })}
        {renderizarCampo("confirmarSenha", "Confirmar senha", "Repita a senha", {
          type: "password",
          autoComplete: "new-password",
        })}
      </div>

      {/* === Seção: Aceite dos termos === */}
      <label className="formulario__aceite">
        <input
          type="checkbox"
          className="formulario__caixaSelecao"
          checked={aceitouTermos}
          onChange={(evento) => {
            setAceitouTermos(evento.target.checked);
            setErrosCampos((anteriores) => ({ ...anteriores, termos: undefined }));
          }}
          aria-invalid={errosCampos.termos ? true : undefined}
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="formulario__linkTermos" target="_blank">
            Termos da comunidade
          </Link>
          .
        </span>
      </label>
      {errosCampos.termos && <span className="formulario__dica formulario__dicaTermos">{errosCampos.termos}</span>}

      {/* === Seção: Erro geral === */}
      {erroGeral && (
        <p className="formulario__mensagemErro" role="alert">
          {erroGeral}
        </p>
      )}

      {/* === Seção: Ações === */}
      <button type="submit" className="formulario__botaoPrincipal" disabled={enviando}>
        {enviando ? "Criando conta…" : "Criar conta"}
      </button>

      <hr className="formulario__divisoria" />

      <p className="formulario__alternarConta">
        Já tem uma conta? <LinkAcesso para="/entrar">Entrar</LinkAcesso>
      </p>
    </form>
  );
}
