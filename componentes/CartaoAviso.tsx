import Image from "next/image";
import type { ReactNode } from "react";
import carimboPostal from "@/public/imagens/carimbo-postal.png";
import "@/estilos/componentes/CartaoAviso.css";

// === Seção: Tipos ===
type PropsCartaoAviso = {
  // Texto grande dentro do selo (ex.: "404")
  selo: string;
  etiqueta: string;
  tituloPreto: string;
  tituloRosa: string;
  cursiva: string;
  texto: string;
  children: ReactNode;
};

// === Seção: Cartão-postal de aviso (página não encontrada, erro) ===
export default function CartaoAviso({ selo, etiqueta, tituloPreto, tituloRosa, cursiva, texto, children }: PropsCartaoAviso) {
  return (
    <section className="cartaoAviso fundoPontosRosa">
      <div className="cartaoAviso__cartao envelopeCorreio">
        {/* === Seção: Selo === */}
        <div className="cartaoAviso__colunaSelo" aria-hidden="true">
          <div className="cartaoAviso__selo">
            <div className="cartaoAviso__seloMiolo">
              <span className="cartaoAviso__seloNumero">{selo}</span>
              <span className="cartaoAviso__seloMarca">LUCKY CEGS</span>
            </div>
          </div>
          <Image src={carimboPostal} alt="" sizes="150px" className="cartaoAviso__carimbo" />
        </div>

        {/* === Seção: Mensagem === */}
        <div className="cartaoAviso__textos">
          <p className="cartaoAviso__etiqueta">{etiqueta}</p>
          <h1 className="cartaoAviso__titulo">
            {tituloPreto}
            <span className="cartaoAviso__tituloRosa">{tituloRosa}</span>
          </h1>
          <p className="cartaoAviso__cursiva">{cursiva}</p>
          <p className="cartaoAviso__texto">{texto}</p>
          <div className="cartaoAviso__acoes">{children}</div>
        </div>
      </div>
    </section>
  );
}
