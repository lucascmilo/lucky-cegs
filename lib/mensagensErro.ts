import { TAMANHO_MINIMO_SENHA, TAMANHO_USER } from "@/lib/configuracoes";

// === Seção: Tradução dos erros do Better Auth ===
type ContextoErro = "entrar" | "criarConta";

export const MENSAGEM_USER_INVALIDO = `Use de ${TAMANHO_USER.minimo} a ${TAMANHO_USER.maximo} caracteres: letras, números ou _.`;

const MENSAGEM_PADRAO: Record<ContextoErro, string> = {
  entrar: "Não foi possível entrar agora. Tente novamente.",
  criarConta: "Não foi possível criar a conta agora. Tente novamente.",
};

// Cada linha: trechos do código de erro → mensagem mostrada
const TRADUCOES: [string[], string][] = [
  [["INVALID_USERNAME_OR_PASSWORD", "INVALID_EMAIL_OR_PASSWORD"], "User ou senha incorretos."],
  [["USERNAME_IS_ALREADY_TAKEN", "USER_ALREADY_EXISTS"], "Esse user já tem uma conta. Tente entrar."],
  [["USERNAME_TOO_SHORT", "USERNAME_TOO_LONG", "INVALID_USERNAME"], `User inválido. ${MENSAGEM_USER_INVALIDO}`],
  [["PASSWORD_TOO_SHORT"], `A senha precisa ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`],
  [["BANNED"], "Essa conta está bloqueada. Fale com a GOM."],
  [["TOO_MANY_REQUESTS", "RATE_LIMIT"], "Muitas tentativas seguidas. Espere um pouco e tente de novo."],
];

export function traduzirErroAutenticacao(codigo: string | undefined, contexto: ContextoErro) {
  const codigoNormalizado = (codigo ?? "").toUpperCase();
  const traducao = TRADUCOES.find(([trechos]) => trechos.some((trecho) => codigoNormalizado.includes(trecho)));
  return traducao?.[1] ?? MENSAGEM_PADRAO[contexto];
}

// Aceita o user com ou sem "@" na frente
export function limparUser(valor: string) {
  return valor.trim().replace(/^@+/, "");
}
