import Image from "next/image";
import SeloPedidosAbertos from "@/componentes/SeloPedidosAbertos";
import codigoBarras from "@/public/imagens/codigo-barras.png";
import colagemInicio from "@/public/imagens/inicio-colagem.webp";
import photocardInicio from "@/public/imagens/inicio-photocard.png";
import "@/estilos/paginas/Inicio.css";

// === Seção: Tela inicial ===
export default function PaginaInicial() {
  return (
    <section className="inicio__hero">
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
        </div>

        {/* === Seção: Colagem (camadas na ordem do protótipo) === */}
        <div className="inicio__colagem">
          <Image
            src={colagemInicio}
            alt="Colagem com photocards, álbuns e cacarecos"
            priority
            sizes="(max-width: 860px) 90vw, 562px"
            className="inicio__imagemColagem"
          />
          <Image src={photocardInicio} alt="" sizes="170px" className="inicio__photocard" />
          <Image src={codigoBarras} alt="" sizes="163px" className="inicio__codigoBarras" />
          <SeloPedidosAbertos className="inicio__selo" />
        </div>
      </div>
    </section>
  );
}
