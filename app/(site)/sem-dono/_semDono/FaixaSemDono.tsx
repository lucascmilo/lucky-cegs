import Image from "next/image";
import type { ReactNode } from "react";
import { juntarClasses } from "@/lib/classes";
import recortePixel from "@/public/imagens/adesivo-recorte-pixel.png";
import chaveiro from "@/public/imagens/chaveiro.png";
import fotoJoiner from "@/public/imagens/sem-dono-modelo.png";
import fotoGom from "@/public/imagens/modelo-gom-sem-dono.png";
import "@/estilos/paginas/SemDono.css";

type PropsFaixaSemDono = {
  subtitulo: ReactNode;
  // Versão da GOM: faixa rosa, outra foto e o botão de ação embaixo do texto
  gom?: boolean;
  acao?: ReactNode;
};

// === Seção: Faixa do topo do Sem dono (joiner e GOM) ===
export default function FaixaSemDono({ subtitulo, gom = false, acao }: PropsFaixaSemDono) {
  return (
    <section className={juntarClasses("semDono__faixa", gom && "semDono__faixaGom")}>
      <div className="semDono__faixaConteudo">
        <h1 className="tituloFaixa">
          <span>ITENS</span>
          <span className="tituloFaixa__rosa">sem dono</span>
        </h1>
        <p className="tituloFaixa__subtitulo">{subtitulo}</p>
        {acao}

        <div className="semDono__colagem" aria-hidden="true">
          <span className={juntarClasses("semDono__quadrado", gom ? "fundoTrevosCreme" : "fundoTrevosRosa")} />
          <Image src={gom ? fotoGom : fotoJoiner} alt="" sizes="190px" className="semDono__foto" priority />
          <Image src={recortePixel} alt="" sizes="80px" className="semDono__recorte" />
          <Image src={chaveiro} alt="" sizes="153px" className="semDono__chaveiro" />
        </div>
      </div>
    </section>
  );
}
