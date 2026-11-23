import type { EtapaCaixa, EtapaItem } from "@/lib/etapas";

// Tipos e contas da planilha da caixa (versão da GOM). Sem banco: serve para a tela e para o servidor.

// === Seção: Categorias ===
export const CATEGORIAS = [
  { id: "pc", rotulo: "Photocard", resumo: "Photocards", sigla: "PC" },
  { id: "postcard", rotulo: "Postcard", resumo: "Postcards", sigla: "POST" },
  { id: "smini", rotulo: "Smini", resumo: "Smini", sigla: "SM" },
  { id: "album", rotulo: "Álbuns", resumo: "Álbuns", sigla: "ALB" },
  { id: "itens", rotulo: "Itens", resumo: "Itens", sigla: "ITEM" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["id"];
export type Quantidades = Record<Categoria, number>;

export const QUANTIDADES_ZERADAS: Quantidades = { pc: 0, postcard: 0, smini: 0, album: 0, itens: 0 };

// === Seção: Tipos ===
export type CaixaGom = {
  id: number;
  nome: string;
  situacao: EtapaCaixa;
  // Sigla do país (JP, KR, CH, PH)
  origem: string | null;
  // "aaaa-mm-dd"
  abertura: string | null;
  observacao: string | null;
};

export type JoinerOpcao = { id: string; user: string; nome: string };

export type ParteGom = {
  id: number;
  user: string;
  membro: string | null;
  venda: number | null;
  inter: number | null;
  taxa: number | null;
  vendaPago: boolean;
  interPago: boolean;
  taxaPago: boolean;
  quantidades: Quantidades;
};

export type RegistroGom = {
  id: number;
  tipo: "individual" | "set";
  nome: string;
  grupo: string | null;
  membro: string | null;
  situacao: EtapaItem;
  pesoKg: number | null;
  compra: number | null;
  fotoId: string | null;
  proofWhId: string | null;
  semDono: boolean;
  precoSemDono: number | null;
  quantidades: Quantidades;
  partes: ParteGom[];
  atualizadoEm: Date;
};

type ResumoCaixa = {
  venda: number;
  compra: number;
  lucro: number;
  peso: number;
  quantidades: Quantidades;
};

// === Seção: Contas ===
// Item sem dono vale o preço do anúncio; os outros, a soma das partes
function vendaDoRegistro(registro: RegistroGom) {
  if (registro.semDono) return registro.precoSemDono ?? 0;
  return registro.partes.reduce((total, parte) => total + (parte.venda ?? 0), 0);
}

function somarQuantidades(lista: Quantidades[]): Quantidades {
  const total = { ...QUANTIDADES_ZERADAS };
  for (const quantidades of lista) {
    for (const { id } of CATEGORIAS) total[id] += quantidades[id];
  }
  return total;
}

export function resumirCaixa(registros: RegistroGom[]): ResumoCaixa {
  const venda = registros.reduce((total, r) => total + vendaDoRegistro(r), 0);
  const compra = registros.reduce((total, r) => total + (r.compra ?? 0), 0);
  return {
    venda,
    compra,
    lucro: venda - compra,
    peso: registros.reduce((total, r) => total + (r.pesoKg ?? 0), 0),
    quantidades: somarQuantidades(registros.map((r) => r.quantidades)),
  };
}

// === Seção: Valores digitados ===
// Aceita "12,50", "12.50", "R$ 1.234,50". Vazio = null; texto inválido = NaN.
export function lerNumero(texto: string) {
  const limpo = texto.replace(/R\$|\s/g, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return /^\d+(\.\d+)?$/.test(normalizado) ? Number(normalizado) : Number.NaN;
}

const formatadorPeso = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export function formatarPeso(kg: number) {
  return `${formatadorPeso.format(kg)} kg`;
}
