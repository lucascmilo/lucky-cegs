import Image from "next/image";
import type { ReactNode } from "react";
import TransicaoPagina from "@/componentes/TransicaoPagina";
import { juntarClasses } from "@/lib/classes";
import carimboPostal from "@/public/imagens/carimbo-postal.svg";
import PainelColagem, { type VarianteAcesso } from "./PainelColagem";
import "@/estilos/paginas/acesso/TelaAcesso.css";

// === Seção: Tipos ===
type PropsTelaAcesso = {
  variante: VarianteAcesso;
  saudacao: string;
  titulo: ReactNode;
  children: ReactNode;
};

// === Seção: Estrutura das telas de acesso ===
export default function TelaAcesso({
  variante,
  saudacao,
  titulo,
  children,
}: PropsTelaAcesso) {
  return (
    <div className="telaAcesso__tela">
      {/* === Seção: Colagem === */}
      <PainelColagem variante={variante} />

      {/* === Seção: Cartão-postal === */}
      <main className="telaAcesso__areaCartao">
        <TransicaoPagina>
          <div
            className={juntarClasses(
              "telaAcesso__cartao",
              variante === "entrar" && "telaAcesso__cartaoEntrar",
            )}
          >
            <div className="telaAcesso__molduraRosa">
              <p className="telaAcesso__marca">LUCKY CEGS · POST CARD CO.</p>
              <Image
                src={carimboPostal}
                alt=""
                className="telaAcesso__carimbo"
                sizes="184px"
                priority
              />

              <p className="telaAcesso__saudacao">{saudacao}</p>
              <h1 className="telaAcesso__titulo">{titulo}</h1>

              {children}
            </div>
          </div>
        </TransicaoPagina>
      </main>
    </div>
  );
}