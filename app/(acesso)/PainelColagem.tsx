import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import FaixaLetreiro from "@/componentes/FaixaLetreiro";
import SeloPedidosAbertos from "@/componentes/SeloPedidosAbertos";
import adesivoAccidentally from "@/public/imagens/adesivo-accidentally.png";
import brilhoAmarelo from "@/public/imagens/brilho-amarelo.png";
import brilhoRosa from "@/public/imagens/brilho-rosa.png";
import cd from "@/public/imagens/cd.png";
import chaveiro from "@/public/imagens/chaveiro.png";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import coracaoBranco from "@/public/imagens/coracao-branco.png";
import modeloCriarConta from "@/public/imagens/criar-conta-modelo.webp";
import modeloEntrar from "@/public/imagens/entrar-modelo.webp";
import polaroidCriarConta from "@/public/imagens/polaroid-criar-conta.png";
import polaroidEntrar from "@/public/imagens/polaroid-entrar.png";
import "@/estilos/paginas/acesso/PainelColagem.css";

// === Seção: Tipos ===
export type VarianteAcesso = "entrar" | "criarConta";

type Peca =
  | "codigoBarras"
  | "chaveiro"
  | "polaroid"
  | "cd"
  | "coracao"
  | "brilhos"
  | "selo"
  | "adesivo"
  | "etiquetas"
  | "modelo";

// === Seção: Ordem das camadas ===
// A última peça da lista fica por cima.
const CAMADAS: Record<VarianteAcesso, Peca[]> = {
  entrar: ["codigoBarras", "cd", "coracao", "brilhos", "etiquetas", "chaveiro", "polaroid", "modelo", "selo"],
  criarConta: [
    "codigoBarras",
    "chaveiro",
    "polaroid",
    "cd",
    "coracao",
    "brilhos",
    "selo",
    "adesivo",
    "etiquetas",
    "modelo",
  ],
};

// === Seção: Peças da colagem ===
function renderizarPeca(peca: Peca, ehEntrar: boolean): ReactNode {
  switch (peca) {
    case "codigoBarras":
      return <Image src={codigoBarras} alt="" className="painelColagem__codigoBarras" sizes="163px" />;
    case "chaveiro":
      return <Image src={chaveiro} alt="" className="painelColagem__chaveiro" sizes="153px" />;
    case "polaroid":
      return (
        <Image
          src={ehEntrar ? polaroidEntrar : polaroidCriarConta}
          alt=""
          className="painelColagem__polaroid"
          sizes="189px"
        />
      );
    case "cd":
      return <Image src={cd} alt="" className="painelColagem__cd" sizes="80px" />;
    case "coracao":
      return <Image src={coracaoBranco} alt="" className="painelColagem__coracao" />;
    case "brilhos":
      return (
        <>
          <Image src={brilhoRosa} alt="" className="painelColagem__brilhoRosa" />
          <Image src={brilhoAmarelo} alt="" className="painelColagem__brilhoAmarelo painelColagem__brilhoUm" />
          <Image src={brilhoAmarelo} alt="" className="painelColagem__brilhoAmareloMaior painelColagem__brilhoDois" />
        </>
      );
    case "selo":
      return <SeloPedidosAbertos className="painelColagem__selo" />;
    case "adesivo":
      return <Image src={adesivoAccidentally} alt="" className="painelColagem__adesivo" sizes="372px" />;
    case "etiquetas":
      return (
        <>
          <span className="painelColagem__etiqueta painelColagem__etiquetaUm">agora com uma cara diferente</span>
          <span className="painelColagem__etiqueta painelColagem__etiquetaDois">do pedido até sua casa</span>
        </>
      );
    case "modelo":
      return ehEntrar ? (
        <Image src={modeloEntrar} alt="" className="painelColagem__modelo" sizes="518px" priority />
      ) : (
        <Image src={modeloCriarConta} alt="" className="painelColagem__modelo" sizes="289px" priority />
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
        <span className="painelColagem__circulo" />

        <p className="painelColagem__titulo">
          <span className="painelColagem__tituloLucky">LUCKY</span>
          <span className="painelColagem__tituloCegs">CEGS</span>
        </p>

        {CAMADAS[variante].map((peca) => (
          <Fragment key={peca}>{renderizarPeca(peca, ehEntrar)}</Fragment>
        ))}
      </div>
    </aside>
  );
}
