import type { Metadata, Viewport } from "next";
import { Archivo_Black, Figtree, Pinyon_Script, Silkscreen } from "next/font/google";
import "@/estilos/globais.css";

// === Seção: Fontes do projeto ===
const figtree = Figtree({
  variable: "--fonte-figtree",
  subsets: ["latin"],
});

const pinyonScript = Pinyon_Script({
  variable: "--fonte-pinyon-script",
  weight: "400",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--fonte-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--fonte-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// === Seção: Metadados ===
export const metadata: Metadata = {
  title: "Lucky Cegs",
  description: "Organização de CEG's de sets nacionais e internacionais.",
};

export const viewport: Viewport = {
  themeColor: "#efebe5",
};

// === Seção: Layout raiz ===
export default function LayoutRaiz({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} ${pinyonScript.variable} ${archivoBlack.variable} ${silkscreen.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
