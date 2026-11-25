import type { Metadata } from "next";
import Image from "next/image";
import adesivoPixelado from "@/public/imagens/adesivo-pixelado.png";
import estrela from "@/public/imagens/estrela-modelo.png";
import photocard from "@/public/imagens/photocard-termos.png";
import IndiceTermos from "./IndiceTermos";
import { INTRODUCAO_TERMOS, SECOES_TERMOS } from "./conteudoTermos";
import "@/estilos/paginas/Termos.css";

// === Seção: Metadados ===
export const metadata: Metadata = {
  title: "Termos da comunidade · Lucky Cegs",
  description: "As regras da LUCKY CEGS, num lugar só.",
};

// === Seção: Página Termos da comunidade ===
export default function PaginaTermos() {
  return (
    <div className="termos">
      {/* === Seção: Faixa de título === */}
      <section className="termos__faixa">
        <div className="termos__faixaConteudo">
          <h1 className="tituloFaixa">
            <span>TERMOS</span>
            <span className="tituloFaixa__rosa">da comunidade</span>
          </h1>
          <p className="tituloFaixa__subtitulo">As regras da LUCKY CEGS, num lugar só.</p>

          <div className="termos__colagem" aria-hidden="true">
            <span className="termos__quadradoAzul" />
            <Image src={photocard} alt="" className="termos__photocard" sizes="232px" priority />
            <Image src={estrela} alt="" className="termos__estrela" sizes="175px" priority />
            <Image src={adesivoPixelado} alt="" className="termos__adesivo" sizes="90px" />
          </div>
        </div>
      </section>

      <div className="termos__conteudo">
        {/* === Seção: Introdução === */}
        <p className="termos__introducao">{INTRODUCAO_TERMOS}</p>

        <div className="termos__corpo">
          {/* === Seção: Índice lateral === */}
          <IndiceTermos
            itens={SECOES_TERMOS.map(({ id, numero, tituloIndice }) => ({
              id,
              numero,
              titulo: tituloIndice,
            }))}
          />

          {/* === Seção: Regras === */}
          <article className="termos__cartao">
            {SECOES_TERMOS.map((secao) => (
              <section
                key={secao.id}
                id={secao.id}
                className="termos__secao"
                aria-labelledby={`titulo-${secao.id}`}
              >
                <h2 id={`titulo-${secao.id}`} className="termos__tituloSecao">
                  <span className="termos__numeroSecao">{secao.numero}</span>
                  {secao.titulo}
                </h2>
                <ul className="termos__itens listaEstrelas">
                  {secao.itens.map((item, indice) => (
                    <li key={indice}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}