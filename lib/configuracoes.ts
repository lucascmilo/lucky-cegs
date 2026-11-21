// === Seção: Dados fixos da loja ===
export const EMAIL_PIX = "luckycegs@gmail.com";

// === Seção: Playlist do player da barra superior ===
export type Musica = {
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

// User do Twitter/X: letras, números e "_", de 3 a 15 caracteres
export const PADRAO_USER = /^[a-zA-Z0-9_]{3,15}$/;

export const TAMANHO_MINIMO_SENHA = 8;
