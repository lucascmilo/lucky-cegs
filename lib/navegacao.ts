// === Seção: Tipos ===
export type Papel = "admin" | "user" | null;

type LinkNavegacao = {
  rotulo: string;
  destino: string;
};

// === Seção: Links por perfil ===
const linksVisitante: LinkNavegacao[] = [
  { rotulo: "Início", destino: "/" },
  { rotulo: "Sem dono", destino: "/sem-dono" },
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

// === Seção: Volta depois do login ===
// Páginas que exigem login mandam para /entrar?voltar=<página>; depois de entrar, a pessoa volta para ela.
export function enderecoEntrar(voltarPara: string) {
  return `/entrar?voltar=${encodeURIComponent(voltarPara)}`;
}

// Só aceita endereços do próprio site (evita mandar a pessoa para outro domínio)
export function destinoSeguro(voltar: string | null) {
  return voltar && voltar.startsWith("/") && !voltar.startsWith("//") && !voltar.startsWith("/\\") ? voltar : "/";
}

export function destinoDepoisDoLogin() {
  return destinoSeguro(new URLSearchParams(window.location.search).get("voltar"));
}

// === Seção: Parâmetros do endereço ===
// ?filtro=a&filtro=b chega como lista: vale o primeiro
export function textoDoParametro(valor: string | string[] | undefined) {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}
