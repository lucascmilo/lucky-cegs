// === Seção: Tradução dos erros do Better Auth ===
export function traduzirErroAutenticacao(codigo: string | undefined, contexto: "entrar" | "criarConta") {
  const codigoNormalizado = (codigo ?? "").toUpperCase();

  if (codigoNormalizado.includes("INVALID_USERNAME_OR_PASSWORD") || codigoNormalizado.includes("INVALID_EMAIL_OR_PASSWORD")) {
    return "User ou senha incorretos.";
  }
  if (codigoNormalizado.includes("USERNAME_IS_ALREADY_TAKEN") || codigoNormalizado.includes("USER_ALREADY_EXISTS")) {
    return "Esse user já tem uma conta. Tente entrar.";
  }
  if (codigoNormalizado.includes("USERNAME_TOO_SHORT") || codigoNormalizado.includes("USERNAME_TOO_LONG") || codigoNormalizado.includes("INVALID_USERNAME")) {
    return "User inválido. Use de 3 a 15 caracteres: letras, números ou _.";
  }
  if (codigoNormalizado.includes("PASSWORD_TOO_SHORT")) {
    return "A senha precisa ter no mínimo 8 caracteres.";
  }
  if (codigoNormalizado.includes("BANNED")) {
    return "Essa conta está bloqueada. Fale com a GOM.";
  }
  if (codigoNormalizado.includes("TOO_MANY_REQUESTS") || codigoNormalizado.includes("RATE_LIMIT")) {
    return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
  }

  return contexto === "entrar"
    ? "Não foi possível entrar agora. Tente novamente."
    : "Não foi possível criar a conta agora. Tente novamente.";
}

// Remove o "@" do começo e espaços do user digitado
export function limparUser(valor: string) {
  return valor.trim().replace(/^@+/, "");
}
