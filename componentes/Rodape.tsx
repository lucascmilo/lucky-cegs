import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EMAIL_PIX } from "@/lib/configuracoes";
import { obterLinksNavegacao, type Papel } from "@/lib/navegacao";
import { obterUsuarioAtual } from "@/lib/sessao";
import coracaoRosa from "@/public/imagens/coracao-rosa.png";
import BotaoCopiar from "./BotaoCopiar";
import "@/estilos/componentes/Rodape.css";

// === Seção: Lista de links do rodapé ===
function ListaLinksRodape({ papel }: { papel: Papel }) {
  return (
    <ul className="rodape__listaLinks">
      {obterLinksNavegacao(papel).map((link) => (
        <li key={link.destino}>
          <Link href={link.destino} className="rodape__link">
            {link.rotulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function LinksRodapeComSessao() {
  const usuario = await obterUsuarioAtual();
  return <ListaLinksRodape papel={usuario?.papel ?? null} />;
}

// === Seção: Rodapé ===
export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape__conteudo">
        {/* === Seção: Marca e links === */}
        <div className="rodape__colunaMarca">
          <p className="rodape__marcaContorno" aria-label="Lucky Cegs">
            LUCKY CEGS
          </p>
          <nav aria-label="Links do rodapé">
            <Suspense fallback={<ListaLinksRodape papel={null} />}>
              <LinksRodapeComSessao />
            </Suspense>
          </nav>
        </div>

        {/* === Seção: Card do Pix e assinatura === */}
        <div className="rodape__colunaPix">
          <div className="rodape__cardPix">
            <h2 className="rodape__tituloPix">PIX · LUCKY CEGS</h2>
            <span className="rodape__emailPix">{EMAIL_PIX}</span>
            <div className="rodape__acoesPix">
              <BotaoCopiar texto={EMAIL_PIX} variante="rosa" />
              <p className="rodape__avisoPix">Enviar comprovantes apenas pelo grupo</p>
            </div>
          </div>

          <p className="rodape__assinatura">
            <span className="rodape__feitoCom">feito com</span>
            <Image src={coracaoRosa} alt="" className="rodape__coracao" />
            <span>pela equipe</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
