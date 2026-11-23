// === Seção: Falha de conexão ao salvar ===
// Se a internet cair no meio de um "Salvar", a ação do servidor não responde e o erro vira uma mensagem clara.
// A janela continua aberta com tudo o que foi preenchido, pronta para tentar de novo.

const SEM_INTERNET = "Sem internet. Confira a conexão e tente de novo: o que você preencheu continua aqui.";
const SEM_RESPOSTA = "O servidor não respondeu. Tente de novo em instantes: o que você preencheu continua aqui.";

export function mensagemDeFalha() {
  return typeof navigator !== "undefined" && !navigator.onLine ? SEM_INTERNET : SEM_RESPOSTA;
}

// Chama a ação do servidor; se a conexão falhar, devolve um erro no mesmo formato das ações
export async function chamar<T>(acao: () => Promise<T>): Promise<T | { ok: false; erro: string; erros: Record<string, string> }> {
  try {
    return await acao();
  } catch {
    return { ok: false, erro: mensagemDeFalha(), erros: {} };
  }
}
