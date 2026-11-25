import Image from "next/image";
import type { ReactNode } from "react";
import FaixaLetreiro from "@/componentes/FaixaLetreiro";
import adesivoTrevoFoto from "@/public/imagens/adesivo-trevo-foto.png";
import trevo from "@/public/imagens/adesivo-trevo-preto.png";
import chaveiro from "@/public/imagens/chaveiro.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import modeloCriarConta from "@/public/imagens/criar-conta-modelo.png";
import modeloEntrar from "@/public/imagens/entrar-modelo.png";
import polaroid from "@/public/imagens/polaroid-entrar.png";
import "@/estilos/paginas/acesso/PainelColagem.css";

// === Seção: Tipos ===
export type VarianteAcesso = "entrar" | "criarConta";

type Peca =
  | "codigoBarras"
  | "chaveiro"
  | "polaroid"
  | "trevo"
  | "adesivoTrevoFoto"
  | "etiquetas"
  | "modelo";

// === Seção: Ordem das camadas ===
// A última peça da lista fica por cima.
const CAMADAS: Record<VarianteAcesso, Peca[]> = {
  entrar: ["codigoBarras", "trevo", "etiquetas", "chaveiro", "polaroid", "modelo"],
  criarConta: [
    "codigoBarras",
    "chaveiro",
    "polaroid",
    "trevo",
    "adesivoTrevoFoto",
    "etiquetas",
    "modelo",
  ],
};

// === Seção: Peças da colagem ===
function renderizarPeca(peca: Peca, ehEntrar: boolean): ReactNode {
  switch (peca) {
    case "codigoBarras":
      return <Image key={peca} src={codigoBarras} alt="" className="painelColagem__codigoBarras" sizes="163px" />;
    case "chaveiro":
      return <Image key={peca} src={chaveiro} alt="" className="painelColagem__chaveiro" sizes="153px" />;
    case "polaroid":
      return (
        <Image key={peca} src={polaroid} alt="" className="painelColagem__polaroid" sizes="189px" />
      );
    case "trevo":
      return <Image key={peca} src={trevo} alt="" className="painelColagem__trevo" sizes="80px" />;
    case "adesivoTrevoFoto":
      return (
        <Image
          key={peca}
          src={adesivoTrevoFoto}
          alt=""
          className="painelColagem__adesivoTrevoFoto"
          sizes="80px"
        />
      );
    case "etiquetas":
      return (
        <span key={peca} className="painelColagem__grupoEtiquetas">
          <span className="painelColagem__etiqueta painelColagem__etiquetaUm">agora com uma cara diferente</span>
          <span className="painelColagem__etiqueta painelColagem__etiquetaDois">do pedido até sua casa</span>
        </span>
      );
    case "modelo":
      return ehEntrar ? (
        <Image key={peca} src={modeloEntrar} alt="" className="painelColagem__modelo" sizes="518px" priority />
      ) : (
        <Image
          key={peca}
          src={modeloCriarConta}
          alt=""
          className="painelColagem__modelo"
          sizes="289px"
          priority
        />
      );
  }
}

// === Seção: Painel de colagem ===
export default function PainelColagem({ variante }: { variante: VarianteAcesso }) {
  const ehEntrar = variante === "entrar";

  return (
    <aside className={`painelColagem__painel painelColagem__${variante}`} aria-hidden="true">
      {/* === Seção: Letreiros === */}
      <FaixaLetreiro variante="rosa" className="painelColagem__letreiroTopo" />
      <FaixaLetreiro variante="preta" className="painelColagem__letreiroBase" />

      {/* === Seção: Palco === */}
      <div className="painelColagem__palco">
        <span className="painelColagem__quadrado" />

        <p className="painelColagem__titulo">
          <span className="painelColagem__tituloLucky">LUCKY</span>
          <span className="painelColagem__tituloCegs">CEGS</span>
        </p>

        {CAMADAS[variante].map((peca) => renderizarPeca(peca, ehEntrar))}
      </div>
    </aside>
  );
}