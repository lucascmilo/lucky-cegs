import AvisoFlutuante from "@/componentes/AvisoFlutuante";
import { formatarReais } from "@/lib/formatacao";
import { CATEGORIAS, formatarPeso, resumirCaixa, type CaixaGom, type JoinerOpcao, type RegistroGom } from "@/lib/planilhaCaixa";
import FaixaCaixaGom from "./FaixaCaixaGom";
import PlanilhaCaixa from "./PlanilhaCaixa";
import "@/estilos/componentes/PecasItem.css";
import "@/estilos/paginas/Caixa.css";
import "@/estilos/paginas/CaixaGom.css";

type PropsTelaCaixaGom = {
  caixa: CaixaGom;
  caixas: CaixaGom[];
  registros: RegistroGom[];
  joiners: JoinerOpcao[];
  abrirNovoItem: boolean;
  abrirNovaCaixa: boolean;
  inicialPlanilha: { busca: string; ordem: string; filtro: string };
};

// === Seção: Caixa da GOM (resumo e planilha com todos os valores) ===
// As keys recriam as partes com estado ao trocar de caixa (seleção e janela não passam de uma caixa para outra)
export default function TelaCaixaGom({
  caixa,
  caixas,
  registros,
  joiners,
  abrirNovoItem,
  abrirNovaCaixa,
  inicialPlanilha,
}: PropsTelaCaixaGom) {
  const resumo = resumirCaixa(registros);
  const joinersDaCaixa = [...new Set(registros.flatMap((r) => r.partes.map((p) => p.user)))].sort();

  const quadros = [
    { rotulo: "Venda Total", valor: formatarReais(resumo.venda) },
    { rotulo: "Compra Total", valor: formatarReais(resumo.compra) },
    { rotulo: "Lucro", valor: formatarReais(resumo.lucro), negativo: resumo.lucro < 0 },
    { rotulo: "Peso Total", valor: formatarPeso(resumo.peso) },
    ...CATEGORIAS.map((categoria) => ({ rotulo: categoria.resumo, valor: String(resumo.quantidades[categoria.id]) })),
  ];

  return (
    <div className="caixaGom">
      <FaixaCaixaGom
        key={`faixa-${caixa.id}`}
        caixa={caixa}
        caixas={caixas}
        joiners={joiners}
        joinersDaCaixa={joinersDaCaixa}
        totalRegistros={registros.length}
        abrirNovoItem={abrirNovoItem}
        abrirNovaCaixa={abrirNovaCaixa}
      />

      <div className="caixaGom__conteudo">
        <section aria-labelledby="titulo-resumo">
          <h2 id="titulo-resumo" className="caixaGom__titulo">
            <span>RESUMO</span> <span className="caixaGom__tituloRosa">DA CAIXA</span>
          </h2>
          <dl className="caixaGom__resumo">
            {quadros.map((quadro) => (
              <div key={quadro.rotulo} className="caixaGom__quadro">
                <dt className="caixaGom__rotuloResumo">{quadro.rotulo}</dt>
                <dd className={quadro.negativo ? "caixaGom__valorResumo caixaGom__negativo" : "caixaGom__valorResumo"}>
                  {quadro.valor}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="titulo-registros" className="caixaGom__registros">
          <h2 id="titulo-registros" className="caixaGom__titulo">
            <span>REGISTROS</span> <span className="caixaGom__tituloRosa">DA PLANILHA</span>
          </h2>
          <PlanilhaCaixa key={`planilha-${caixa.id}`} caixa={caixa} caixas={caixas}
            registros={registros}
            joiners={joiners}
            inicial={inicialPlanilha}
          />
        </section>
      </div>

      <AvisoFlutuante />
    </div>
  );
}
