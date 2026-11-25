import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import "@/estilos/componentes/CartaoAviso.css";

// === Seção: Tipos ===
type PropsCartaoAviso = {
  etiqueta?: string;
  tituloPreto?: string;
  tituloRosa?: string;
  cursiva?: string;
  texto?: string;
  // Peça da biblioteca colada na quina do cartão (cada tela usa uma diferente)
  peca: StaticImageData;
  // Imagem exibida na coluna no lugar do selo antigo
  imagemSelo?: StaticImageData;
  children?: ReactNode;
};

// === Seção: Cartão-postal de aviso ===
export default function CartaoAviso({
  etiqueta,
  tituloPreto,
  tituloRosa,
  cursiva,
  texto,
  peca,
  imagemSelo,
  children,
}: PropsCartaoAviso) {
  const temTextos = Boolean(etiqueta || tituloPreto || tituloRosa || cursiva || texto);
  const classeCartao = imagemSelo
    ? "cartaoAviso__cartao--duasColunas"
    : "cartaoAviso__cartao--colunaUnica";

  return (
    <section className="cartaoAviso fundoTrevosRosa">
      <div className={`cartaoAviso__cartao envelopeCorreio ${classeCartao}`}>
        <Image
          src={peca}
          alt=""
          width={peca.width}
          height={peca.height}
          sizes="140px"
          className="cartaoAviso__peca"
          aria-hidden="true"
        />

        {imagemSelo && (
          <div className="cartaoAviso__colunaSelo" aria-hidden="true">
            <Image
              src={imagemSelo}
              alt=""
              width={imagemSelo.width}
              height={imagemSelo.height}
              sizes="(max-width: 760px) 100vw, 220px"
              unoptimized
              className="cartaoAviso__imagemSelo"
            />
          </div>
        )}

        <div className="cartaoAviso__textos">
          {temTextos && (
            <>
              {etiqueta && <p className="cartaoAviso__etiqueta">{etiqueta}</p>}
              {(tituloPreto || tituloRosa) && (
                <h1 className="cartaoAviso__titulo">
                  {tituloPreto}
                  {tituloRosa && <span className="cartaoAviso__tituloRosa">{tituloRosa}</span>}
                </h1>
              )}
              {cursiva && <p className="cartaoAviso__cursiva">{cursiva}</p>}
              {texto && <p className="cartaoAviso__texto">{texto}</p>}
            </>
          )}
          {children && <div className="cartaoAviso__acoes">{children}</div>}
        </div>
      </div>
    </section>
  );
}