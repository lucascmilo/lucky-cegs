import Image from "next/image";
import type { ReactNode } from "react";
import { juntarClasses } from "@/lib/classes";
import coracaoFoto from "@/public/imagens/adesivo-coracao-foto.png";
import colagemInicio from "@/public/imagens/inicio-modelo.png";
import photocardInicio from "@/public/imagens/inicio-photocard.png";
import "@/estilos/paginas/Inicio.css";

// === Seção: Hero da tela inicial ===
// "acoes": botões abaixo do texto (de conta para o visitante; do joiner com o "Falta pagar").
// "textoAlto": sobe o texto para caber o bloco maior de ações do joiner.
export default function HeroInicio({
  acoes,
  textoAlto = false,
}: {
  acoes?: ReactNode;
  textoAlto?: boolean;
}) {
  return (
    <section className={juntarClasses("inicio__hero", textoAlto && "inicio__heroComAcoes")}>
      <div className="inicio__conteudo">
        {/* === Seção: Texto de apresentação === */}
        <div className="inicio__texto">
          <h1 className="inicio__titulo">
            <span className="inicio__tituloPreto">LUCKY</span>
            <span className="inicio__tituloRosa">CEGS</span>
          </h1>

          <div className="inicio__descricao">
            <p>Organização de CEG&apos;s de sets nacionais e internacionais</p>
            <ul className="inicio__listaServicos">
              <li>Caixinha Mercari</li>
              <li>Oferecemos serviço de procura</li>
            </ul>
            <p>Além dos itens anunciados, aceitamos links externos.</p>
          </div>

          {acoes}
        </div>

        {/* === Seção: Colagem === */}
        <div className="inicio__colagem">
          <Image
            src={colagemInicio}
            alt="Colagem com photocards, álbuns e cacarecos"
            priority
            sizes="(max-width: 860px) 90vw, 562px"
            className="inicio__imagemColagem"
          />
          <Image src={photocardInicio} alt="" sizes="170px" className="painel__photocard" />
          <Image src={coracaoFoto} alt="" sizes="100px" className="inicio__adesivoCoracao" />
        </div>
      </div>
    </section>
  );
}