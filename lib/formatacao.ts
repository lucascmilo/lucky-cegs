import { ORIGENS } from "@/lib/configuracoes";

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

// === Seção: Origem da caixa ===
// Converte a sigla (JP, KR…) no nome do país; textos que não são sigla aparecem como estão
export function nomeOrigem(origem: string | null) {
  if (!origem) return null;
  return ORIGENS[origem.trim().toUpperCase()] ?? origem;
}

// === Seção: Quantidades do item ("5 PCS", "1 ÁLBUM"…) ===
type Quantidades = { qtdPc: number; qtdPostcard: number; qtdSmini: number; qtdAlbum: number };

export function descreverQuantidades({ qtdPc, qtdPostcard, qtdSmini, qtdAlbum }: Quantidades) {
  const partes: string[] = [];
  if (qtdPc > 0) partes.push(qtdPc === 1 ? "1 PC" : `${qtdPc} PCS`);
  if (qtdPostcard > 0) partes.push(qtdPostcard === 1 ? "1 POSTCARD" : `${qtdPostcard} POSTCARDS`);
  if (qtdSmini > 0) partes.push(qtdSmini === 1 ? "1 SMINI" : `${qtdSmini} SMINIS`);
  if (qtdAlbum > 0) partes.push(qtdAlbum === 1 ? "1 ÁLBUM" : `${qtdAlbum} ÁLBUNS`);
  return partes;
}

// === Seção: Data curta (dia/mês; com o ano quando não é o ano atual) ===
const formatadorDiaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
const formatadorDiaMesAno = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const formatadorAno = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "America/Sao_Paulo" });

// Sempre com o ano (ex.: 19/11/26)
export function formatarData(data: Date) {
  return formatadorDiaMesAno.format(data);
}

export function formatarDataCurta(data: Date, agora = new Date()) {
  const mesmoAno = formatadorAno.format(data) === formatadorAno.format(agora);
  return (mesmoAno ? formatadorDiaMes : formatadorDiaMesAno).format(data);
}

// === Seção: Momento de um pedido ("hoje às 14:02", "ontem às 09:41", "20/11 às 10:15") ===
const formatadorHora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function formatarMomento(data: Date, agora = new Date()) {
  const dias = Math.round((diaEmSaoPaulo(agora) - diaEmSaoPaulo(data)) / DIA_EM_MS);
  const dia = dias <= 0 ? "hoje" : dias === 1 ? "ontem" : formatadorDiaMes.format(data);
  return `${dia} às ${formatadorHora.format(data)}`;
}

// === Seção: Busca ===
// Ignora maiúsculas e acentos ("japao" encontra "Japão")
export function normalizarBusca(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}
