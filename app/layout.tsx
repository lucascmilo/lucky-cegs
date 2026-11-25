import type { Metadata, Viewport } from "next";
import { Archivo, Figtree, Silkscreen } from "next/font/google";
import "@/estilos/globais.css";

// === Seção: Fontes ===
const figtree = Figtree({
  variable: "--fonte-figtree",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--fonte-archivo",
  axes: ["wdth"],
  subsets: ["latin"],
  display: "swap",
});

const silkscreen = Silkscreen({
  variable: "--fonte-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// === Seção: Metadados ===
export const metadata: Metadata = {
  title: "Lucky Cegs",
  description: "Organização de CEG's de sets nacionais e internacionais.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea4f80",
};

// === Seção: Layout raiz ===
export default function LayoutRaiz({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} ${archivo.variable} ${silkscreen.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}