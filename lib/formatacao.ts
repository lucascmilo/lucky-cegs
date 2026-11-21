// === Seção: Dinheiro ===
const formatadorReais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarReais(valor: number) {
  return formatadorReais.format(valor);
}

// === Seção: Tempo relativo ("hoje", "ontem", "3 dias atrás"...) ===
// Conta os dias pelo calendário de São Paulo, para "hoje" e "ontem" não dependerem do fuso do servidor
const formatadorDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
const DIA_EM_MS = 24 * 60 * 60 * 1000;

function diaEmSaoPaulo(data: Date) {
  return Date.parse(formatadorDia.format(data));
}

export function formatarTempoRelativo(data: Date, agora = new Date()) {
  const dias = Math.round((diaEmSaoPaulo(agora) - diaEmSaoPaulo(data)) / DIA_EM_MS);

  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `${dias} dias atrás`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? "1 semana atrás" : `${semanas} semanas atrás`;
  }
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "1 mês atrás" : `${meses} meses atrás`;
}
