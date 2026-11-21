// === Seção: Tipos ===
export type Papel = "admin" | "user" | null;

type LinkNavegacao = {
  rotulo: string;
  destino: string;
};

// === Seção: Links por perfil ===
const linksVisitante: LinkNavegacao[] = [
  { rotulo: "Início", destino: "/" },
  { rotulo: "Termos", destino: "/termos" },
];

const linksJoiner: LinkNavegacao[] = [
  { rotulo: "Início", destino: "/" },
  { rotulo: "Caixas", destino: "/caixas" },
  { rotulo: "Meus itens", destino: "/meus-itens" },
  { rotulo: "Sem dono", destino: "/sem-dono" },
  { rotulo: "Casa da GOM", destino: "/casa-da-gom" },
  { rotulo: "Termos", destino: "/termos" },
];

const linksGom: LinkNavegacao[] = [
  { rotulo: "Painel", destino: "/painel" },
  { rotulo: "Caixas", destino: "/caixas" },
  { rotulo: "Proofs", destino: "/proofs" },
  { rotulo: "Sem dono", destino: "/sem-dono" },
  { rotulo: "Termos", destino: "/termos" },
];

export function obterLinksNavegacao(papel: Papel): LinkNavegacao[] {
  if (papel === "admin") return linksGom;
  if (papel === "user") return linksJoiner;
  return linksVisitante;
}
