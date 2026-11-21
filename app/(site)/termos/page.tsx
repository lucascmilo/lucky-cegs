import type { Metadata } from "next";
import Image from "next/image";
import brilhoAmarelo from "@/public/imagens/brilho-amarelo.png";
import estrela from "@/public/imagens/termos-estrela.png";
import photocard from "@/public/imagens/termos-photocard.png";
import { INTRODUCAO_TERMOS, SECOES_TERMOS } from "./conteudoTermos";
import IndiceTermos from "./IndiceTermos";
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
          <h1 className="termos__titulo">
            <span>TERMOS</span>
            <span className="termos__tituloRosa">da comunidade</span>
          </h1>
          <p className="termos__subtitulo">As regras da LUCKY CEGS, num lugar só.</p>

          <div className="termos__colagem" aria-hidden="true">
            <span className="termos__quadradoAzul" />
            <Image src={photocard} alt="" className="termos__photocard" sizes="232px" priority />
            <Image src={estrela} alt="" className="termos__estrela" sizes="175px" priority />
            <Image src={brilhoAmarelo} alt="" className="termos__brilho termos__brilhoUm" />
            <Image src={brilhoAmarelo} alt="" className="termos__brilho termos__brilhoDois" />
          </div>
        </div>
      </section>

      <div className="termos__conteudo">
        {/* === Seção: Introdução === */}
        <p className="termos__introducao">{INTRODUCAO_TERMOS}</p>

        <div className="termos__corpo">
          {/* === Seção: Índice lateral === */}
          <IndiceTermos
            itens={SECOES_TERMOS.map(({ id, numero, tituloIndice }) => ({ id, numero, titulo: tituloIndice }))}
          />

          {/* === Seção: Regras === */}
          <article className="termos__cartao">
            {SECOES_TERMOS.map((secao) => (
              <section key={secao.id} id={secao.id} className="termos__secao" aria-labelledby={`titulo-${secao.id}`}>
                <h2 id={`titulo-${secao.id}`} className="termos__tituloSecao">
                  <span className="termos__numeroSecao">{secao.numero}</span>
                  {secao.titulo}
                </h2>
                <ul className="termos__itens">
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
