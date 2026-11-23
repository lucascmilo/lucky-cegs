"use client";

import Image from "next/image";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useAvisoAoSair } from "@/lib/useAvisoAoSair";
import EntradaSenha from "@/componentes/EntradaSenha";
import { IconeCheck } from "@/componentes/Icones";
import { authClient } from "@/lib/auth-client";
import { PADRAO_USER, TAMANHO_MAXIMO_NOME, TAMANHO_MINIMO_SENHA, TAMANHO_USER } from "@/lib/configuracoes";
import { limparUser, MENSAGEM_USER_INVALIDO, traduzirErroAutenticacao } from "@/lib/mensagensErro";
import type { UsuarioAtual } from "@/lib/sessao";
import brilhoAmarelo from "@/public/imagens/brilho-amarelo.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import { alterarNome, alterarUser } from "../acoes";
import "@/estilos/paginas/acesso/Formulario.css";
import "@/estilos/paginas/Perfil.css";

// === Seção: Tipos ===
type PropsTelaPerfil = {
  usuario: UsuarioAtual;
  nomeSalvo: string;
  desde: string;
};

// === Seção: Textos de cada papel ===
const REGRA_USER = `de ${TAMANHO_USER.minimo} a ${TAMANHO_USER.maximo} caracteres, com letras, números ou _.`;

const TEXTOS = {
  user: {
    subtitulo: "Nome, user e senha da sua conta na LUCKY CEGS.",
    nome: "Como a GOM e o pessoal das caixas veem você. No site, aparece sempre em minúsculas.",
    user: "Seu user atual do twitter, usado para entrar no site. O @ antigo fica livre para outra conta.",
    ajudaUser: `Use seu user atual do twitter: ${REGRA_USER}`,
    senha: "A senha atual confirma que é você. Depois da troca, as outras sessões abertas saem da conta.",
  },
  admin: {
    subtitulo: "Nome, user e senha da conta da GOM.",
    nome: "Como os joiners veem a GOM nos avisos e nas caixas. No site, aparece sempre em minúsculas.",
    user: "O @ atual da loja no twitter, usado para entrar no painel. O @ antigo fica livre para outra conta.",
    ajudaUser: `Use o user atual da loja no twitter: ${REGRA_USER}`,
    senha: "Essa conta abre o painel e os valores de compra: prefira uma senha longa. Depois da troca, as outras sessões abertas saem da conta.",
  },
};
type Textos = (typeof TEXTOS)["user"];

// === Seção: Tela do perfil ===
// O cartão de membro do topo acompanha o que é digitado, antes mesmo de salvar
export default function TelaPerfil({ usuario, nomeSalvo, desde }: PropsTelaPerfil) {
  const [rascunhoNome, setRascunhoNome] = useState(nomeSalvo);
  const [rascunhoUser, setRascunhoUser] = useState(usuario.user);

  const textos = TEXTOS[usuario.papel];
  useAvisoAoSair(rascunhoNome.trim() !== nomeSalvo || limparUser(rascunhoUser) !== usuario.user);

  const nomeCartao = rascunhoNome.trim() || nomeSalvo;
  const userCartao = limparUser(rascunhoUser) || usuario.user;

  return (
    <div className="perfil">
      {/* === Seção: Faixa com o cartão de membro === */}
      <section className="perfil__faixa">
        <div className="perfil__faixaConteudo">
          <div className="perfil__textoFaixa">
            <h1 className="tituloFaixa">
              <span>MEU</span>
              <span className="tituloFaixa__rosa">perfil</span>
            </h1>
            <p className="tituloFaixa__subtitulo">{textos.subtitulo}</p>
          </div>

          <CartaoMembro nome={nomeCartao} user={userCartao} gom={usuario.papel === "admin"} desde={desde} />
        </div>
      </section>

      {/* === Seção: Ficha com os dados === */}
      <div className="perfil__conteudo">
        <div className="perfil__ficha">
          <SecaoNome textos={textos} nomeSalvo={nomeSalvo} valor={rascunhoNome} aoMudar={setRascunhoNome} />
          <SecaoUser textos={textos} userSalvo={usuario.user} valor={rascunhoUser} aoMudar={setRascunhoUser} />
          <SecaoSenha textos={textos} />
        </div>
      </div>
    </div>
  );
}

// === Seção: Cartão de membro ===
function CartaoMembro({ nome, user, gom, desde }: { nome: string; user: string; gom: boolean; desde: string }) {
  const inicial = (nome || user).trim().charAt(0).toUpperCase();

  return (
    <div className="perfil__cartao" aria-label={`Cartão de membro de @${user}`} role="img">
      <span className="perfil__fita" aria-hidden="true" />
      <Image src={brilhoAmarelo} alt="" className="perfil__brilho" aria-hidden="true" />

      <div className="perfil__cartaoTopo fundoPontosRosa">
        <span className="perfil__cartaoMarca">LUCKY CEGS</span>
        <span className="perfil__cartaoTipo">{gom ? "GOM" : "MEMBRO"}</span>
      </div>

      <div className="perfil__cartaoCorpo">
        <span className="perfil__avatar" aria-hidden="true">
          {inicial}
        </span>
        <div className="perfil__identidade">
          <span className="perfil__cartaoNome">{nome.toLowerCase()}</span>
          <span className="perfil__cartaoUser">@{user.toLowerCase()}</span>
        </div>
      </div>

      <div className="perfil__cartaoRodape">
        <Image src={codigoBarras} alt="" className="perfil__codigoBarras" />
        <span className="perfil__desde">desde {desde}</span>
      </div>
    </div>
  );
}

// === Seção: Linha da ficha (título e explicação à esquerda, campos à direita) ===
type PropsLinha = {
  titulo: string;
  descricao: string;
  aoEnviar: (evento: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  rodape: ReactNode;
};

function LinhaFicha({ titulo, descricao, aoEnviar, children, rodape }: PropsLinha) {
  const id = `perfil-${titulo.toLowerCase()}`;
  return (
    <form
      className="perfil__linha"
      noValidate
      aria-labelledby={id}
      onSubmit={(evento) => {
        aoEnviar(evento);
        // Leva o foco para o primeiro campo com erro
        const formulario = evento.currentTarget;
        requestAnimationFrame(() => formulario.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      }}
    >
      <div className="perfil__explicacao">
        <h2 id={id} className="perfil__tituloLinha">
          {titulo}
        </h2>
        <p className="perfil__descricao">{descricao}</p>
      </div>
      <div className="perfil__campos">
        {children}
        <div className="perfil__acoes">{rodape}</div>
      </div>
    </form>
  );
}

function RodapeSalvar({ rotulo, enviando, desativado, aviso }: { rotulo: string; enviando: boolean; desativado: boolean; aviso: string | null }) {
  return (
    <>
      <p className="perfil__aviso" role="status">
        {aviso && (
          <>
            <IconeCheck tamanho={12} />
            {aviso}
          </>
        )}
      </p>
      <button type="submit" className="botao botao__preto perfil__botao" disabled={desativado || enviando}>
        {enviando ? "Salvando…" : rotulo}
      </button>
    </>
  );
}

// === Seção: Nome ===
type PropsSecao = { textos: Textos; valor: string; aoMudar: (valor: string) => void };

function SecaoNome({ textos, nomeSalvo, valor, aoMudar }: PropsSecao & { nomeSalvo: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const semMudanca = valor.trim().replace(/\s+/g, " ") === nomeSalvo;

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!valor.trim()) return setErro("Informe um nome.");
    iniciar(async () => {
      const resultado = await alterarNome(valor);
      if (resultado.ok) setAviso("Nome salvo.");
      else setErro(resultado.erro);
    });
  }

  return (
    <LinhaFicha
      titulo="Nome"
      descricao={textos.nome}
      aoEnviar={enviar}
      rodape={<RodapeSalvar rotulo="Salvar nome" enviando={enviando} desativado={semMudanca} aviso={aviso} />}
    >
      <label className="formulario__campo">
        <span className="formulario__rotulo">Nome</span>
        <input
          className="formulario__entrada"
          name="nome"
          autoComplete="name"
          maxLength={TAMANHO_MAXIMO_NOME}
          value={valor}
          onChange={(evento) => {
            aoMudar(evento.target.value);
            setErro(null);
            setAviso(null);
          }}
          aria-invalid={erro ? true : undefined}
        />
        {erro && <span className="formulario__dica">{erro}</span>}
      </label>
    </LinhaFicha>
  );
}

// === Seção: User ===
function SecaoUser({ textos, userSalvo, valor, aoMudar }: PropsSecao & { userSalvo: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const limpo = limparUser(valor);
  const semMudanca = limpo.toLowerCase() === userSalvo.toLowerCase();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!PADRAO_USER.test(limpo)) return setErro(MENSAGEM_USER_INVALIDO);
    iniciar(async () => {
      const resultado = await alterarUser(limpo);
      if (resultado.ok) {
        aoMudar(limpo.toLowerCase());
        setAviso("User salvo. Use o novo @ para entrar.");
      } else setErro(resultado.erro);
    });
  }

  return (
    <LinhaFicha
      titulo="User"
      descricao={textos.user}
      aoEnviar={enviar}
      rodape={<RodapeSalvar rotulo="Salvar user" enviando={enviando} desativado={semMudanca} aviso={aviso} />}
    >
      <label className="formulario__campo">
        <span className="formulario__rotulo">User</span>
        <span className="perfil__envoltorioArroba">
          <span className="perfil__arroba" aria-hidden="true">
            @
          </span>
          <input
            className="formulario__entrada perfil__entradaArroba"
            name="user"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={valor}
            onChange={(evento) => {
              aoMudar(evento.target.value);
              setErro(null);
              setAviso(null);
            }}
            aria-invalid={erro ? true : undefined}
          />
        </span>
        {erro ? (
          <span className="formulario__dica">{erro}</span>
        ) : (
          <span className="perfil__ajuda">{textos.ajudaUser}</span>
        )}
      </label>
    </LinhaFicha>
  );
}

// === Seção: Senha ===
type CamposSenha = { atual: string; nova: string; confirmar: string };
const SENHA_VAZIA: CamposSenha = { atual: "", nova: "", confirmar: "" };

function SecaoSenha({ textos }: { textos: Textos }) {
  const [campos, setCampos] = useState<CamposSenha>(SENHA_VAZIA);
  const [erros, setErros] = useState<Partial<Record<keyof CamposSenha | "geral", string>>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  useAvisoAoSair(Object.values(campos).some(Boolean));

  function atualizar(campo: keyof CamposSenha, valor: string) {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined, geral: undefined }));
    setAviso(null);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const novos: typeof erros = {};
    if (!campos.atual) novos.atual = "Informe a senha atual.";
    if (campos.nova.length < TAMANHO_MINIMO_SENHA) novos.nova = `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres.`;
    else if (campos.nova === campos.atual) novos.nova = "A nova senha precisa ser diferente da atual.";
    if (campos.confirmar !== campos.nova) novos.confirmar = "As senhas não são iguais.";
    setErros(novos);
    if (Object.values(novos).some(Boolean)) return;

    setEnviando(true);
    const { error: falha } = await authClient.changePassword({
      currentPassword: campos.atual,
      newPassword: campos.nova,
      revokeOtherSessions: true,
    });
    setEnviando(false);

    if (falha) {
      const mensagem = traduzirErroAutenticacao(falha.code, "senha");
      setErros(falha.code === "INVALID_PASSWORD" ? { atual: mensagem } : { geral: mensagem });
      return;
    }
    setCampos(SENHA_VAZIA);
    setAviso("Senha trocada.");
  }

  function campo(nome: keyof CamposSenha, rotulo: string, autoComplete: string) {
    return (
      <label className="formulario__campo">
        <span className="formulario__rotulo">{rotulo}</span>
        <EntradaSenha
          className="formulario__entrada"
          name={nome}
          autoComplete={autoComplete}
          value={campos[nome]}
          onChange={(evento) => atualizar(nome, evento.target.value)}
          aria-invalid={erros[nome] ? true : undefined}
        />
        {erros[nome] && <span className="formulario__dica">{erros[nome]}</span>}
      </label>
    );
  }

  return (
    <LinhaFicha
      titulo="Senha"
      descricao={textos.senha}
      aoEnviar={enviar}
      rodape={<RodapeSalvar rotulo="Trocar senha" enviando={enviando} desativado={false} aviso={aviso} />}
    >
      {campo("atual", "Senha atual", "current-password")}
      <div className="perfil__duasColunas">
        {campo("nova", "Nova senha", "new-password")}
        {campo("confirmar", "Repita a nova senha", "new-password")}
      </div>
      {erros.geral && (
        <p className="formulario__mensagemErro" role="alert">
          {erros.geral}
        </p>
      )}
    </LinhaFicha>
  );
}
