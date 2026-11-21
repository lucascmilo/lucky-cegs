// === Seção: Dados fixos da loja ===
export const EMAIL_PIX = "luckycegs@gmail.com";

// === Seção: Origens das caixas ===
// O campo "origem" da caixa guarda a sigla; a tela mostra o nome do país
export const ORIGENS: Record<string, string> = {
  JP: "Japão",
  KR: "Coreia",
  PH: "Filipinas",
  CH: "China",
};

// === Seção: Playlist do player da barra superior ===
type Musica = {
  artista: string;
  titulo: string;
  arquivo: string;
};

export const PLAYLIST: Musica[] = [
  { artista: "Seulgi", titulo: "Baby Not Baby", arquivo: "/musicas/baby-not-baby.mp3" },
  { artista: "Seulgi", titulo: "Weakness", arquivo: "/musicas/weakness.mp3" },
  { artista: "Seulgi", titulo: "Better Dayz", arquivo: "/musicas/better-dayz.mp3" },
  { artista: "Seulgi", titulo: "Rollin' (With My Homies)", arquivo: "/musicas/rollin-with-my-homies.mp3" },
  { artista: "Seulgi", titulo: "Whatever", arquivo: "/musicas/whatever.mp3" },
  { artista: "Seulgi", titulo: "Praying", arquivo: "/musicas/praying.mp3" },
];

// === Seção: Contas ===
// E-mail interno gerado a partir do user (<username>@lucky-cegs.local)
export const DOMINIO_EMAIL_INTERNO = "lucky-cegs.local";

// User do Twitter/X: letras, números e "_"
export const TAMANHO_USER = { minimo: 3, maximo: 15 };
export const PADRAO_USER = new RegExp(`^[a-zA-Z0-9_]{${TAMANHO_USER.minimo},${TAMANHO_USER.maximo}}$`);

export const TAMANHO_MINIMO_SENHA = 8;
