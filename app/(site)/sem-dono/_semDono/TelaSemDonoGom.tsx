import Image from "next/image";
import Link from "next/link";
import type { SemDonoGom } from "@/lib/semDonoGom";
import modeloGomSemDono from "@/public/imagens/modelo-gom-sem-dono.png";
import FaixaSemDono from "./FaixaSemDono";
import TabelaSemDonoGom from "./TabelaSemDonoGom";
import "@/estilos/paginas/SemDono.css";

function contar(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

// === Seção: Sem dono da GOM ===
// Lista os itens sem dono com os pedidos de claim; a GOM escolhe quem fica com cada um.
export default function TelaSemDonoGom({ dados }: { dados: SemDonoGom }) {
  return (
    <div className="semDono">
      <FaixaSemDono
        gom
        subtitulo={`${contar(dados.itensLivres, "item livre", "itens livres")} · ${contar(
          dados.pedidosEsperando,
          "pedido de claim esperando",
          "pedidos de claim esperando",
        )}`}
        acao={
          <Link href="/caixas?novo=1" className="botao botao__rosa semDono__acao">
            + Adicionar item
          </Link>
        }
      />

      <div className="semDono__conteudo">
        {dados.itens.length > 0 ? (
          <TabelaSemDonoGom itens={dados.itens} />
        ) : (
          <div className="semDonoVazio" role="status">
            <div className="semDonoVazio__arte" aria-hidden="true">
              <Image
                src={modeloGomSemDono}
                alt=""
                width={modeloGomSemDono.width}
                height={modeloGomSemDono.height}
                sizes="(max-width: 560px) 220px, 240px"
                className="semDonoVazio__imagem"
              />
            </div>

            <div className="semDonoVazio__conteudo">
              <p className="semDonoVazio__etiqueta">TUDO JÁ TEM DONO</p>
              <h2 className="semDonoVazio__titulo">Nenhum item sobrando</h2>
              <p className="semDonoVazio__texto">
                Quando um item sobrar numa caixa, ele aparece aqui com os pedidos de claim dos joiners.
              </p>
              <Link href="/caixas?novo=1" className="botao botao__rosa semDonoVazio__botao">
                + Adicionar item
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}