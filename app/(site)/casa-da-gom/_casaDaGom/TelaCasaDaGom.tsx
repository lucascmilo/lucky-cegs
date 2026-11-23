import Image from "next/image";
import Link from "next/link";
import type { CaixaPostal } from "@/componentes/CartaoPostal";
import CartaoPostalVazio from "@/componentes/CartaoPostalVazio";
import { ProvedorDetalhes } from "@/componentes/JanelaDetalhes";
import type { CaixaNaCasa } from "@/lib/casaDaGom";
import { ABAS_DETALHES, montarDetalheItem, type DetalheItem } from "@/lib/detalheItem";
import { formatarData } from "@/lib/formatacao";
import { textoDoParametro } from "@/lib/navegacao";
import brilhoRosa from "@/public/imagens/brilho-rosa.png";
import fotoCasaGom from "@/public/imagens/casa-gom-foto.png";
import cd from "@/public/imagens/cd.png";
import Fichario from "./Fichario";
import "@/estilos/paginas/CasaDaGom.css";

type PropsTelaCasaDaGom = {
  caixas: CaixaNaCasa[];
  eu: { nome: string; user: string };
  parametros: { caixa?: string | string[]; item?: string | string[]; aba?: string | string[] };
};

// === Seção: Tela Casa da GOM ===
export default function TelaCasaDaGom({ caixas, eu, parametros }: PropsTelaCasaDaGom) {
  // Os detalhes dos itens já vão prontos para o navegador: a janela abre na hora
  const detalhes: Record<number, DetalheItem> = Object.fromEntries(
    caixas.flatMap((grupo) => grupo.itens.map((item) => [item.id, montarDetalheItem(item, grupo.caixa.nome)])),
  );
  const abaPedida = ABAS_DETALHES.find((a) => a.id === textoDoParametro(parametros.aba))?.id ?? "fotos";

  const postais: CaixaPostal[] = caixas.map((grupo) => ({
    id: grupo.caixa.id,
    nome: grupo.caixa.nome,
    fotoId: grupo.proof?.fotoId ?? null,
    chegouEm: formatarData(grupo.chegouEm),
    enviadaEm: grupo.proof ? formatarData(grupo.proof.enviadaEm) : null,
    itens: grupo.itens.map((item) => ({ id: item.id, nome: item.nome })),
  }));

  return (
    <ProvedorDetalhes
      detalhes={detalhes}
      itemInicial={Number(textoDoParametro(parametros.item)) || null}
      abaInicial={abaPedida}
      somenteFotos
    >
      <div className="casaGom">
        {/* === Seção: Faixa do topo === */}
        <section className="casaGom__faixa">
          <div className="casaGom__faixaConteudo">
            <h1 className="tituloFaixa">
              <span>CASA DA</span>
              <span className="tituloFaixa__rosa">
                GOM<span className="casaGom__cursiva">meu fichário</span>
              </span>
            </h1>
            <p className="tituloFaixa__subtitulo casaGom__descricao">
              Quando a caixa chega, a GOM tira uma foto com todos os seus itens juntos. Só você e a GOM veem.
            </p>

            <div className="casaGom__colagem" aria-hidden="true">
              <span className="casaGom__quadrado" />
              <Image src={fotoCasaGom} alt="" sizes="190px" className="casaGom__foto" priority />
              <Image src={cd} alt="" sizes="80px" className="casaGom__cd" />
              <Image src={brilhoRosa} alt="" className="casaGom__brilho casaGom__brilhoUm" />
              <Image src={brilhoRosa} alt="" className="casaGom__brilho casaGom__brilhoDois" />
            </div>
          </div>
        </section>

        <div className="casaGom__conteudo">
          <div className="casaGom__aviso">
            <span className="casaGom__etiqueta">proof da gom = 1 foto por caixa</span>
            <p>As fotos da warehouse ficam em cada item, na página da caixa.</p>
          </div>

          {postais.length > 0 ? (
            <Fichario caixas={postais} eu={eu} caixaInicial={Number(textoDoParametro(parametros.caixa)) || null} />
          ) : (
            <FicharioVazio />
          )}
        </div>
      </div>
    </ProvedorDetalhes>
  );
}

// === Seção: Aviso quando nenhuma caixa chegou ainda ===
// Um cartão-postal ainda sem foto, com o carimbo "aguardando entrega"
function FicharioVazio() {
  return (
    <CartaoPostalVazio
      legendaFoto="SUA FOTO VEM AQUI"
      carimbo={["AGUARDANDO", "ENTREGA"]}
      titulo="Seu fichário está vazio"
      cursiva="nada chegou ainda"
      descricao="Quando uma caixa sua chegar na casa da GOM, ela tira uma foto com todos os seus itens e o cartão aparece aqui."
      acoes={
        <>
          <Link href="/meus-itens" className="botao botao__rosa">
            Ver meus itens
          </Link>
          <Link href="/caixas" className="botao botao__contorno">
            Ver as caixas
          </Link>
        </>
      }
    />
  );
}
