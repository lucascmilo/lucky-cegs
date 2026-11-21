import Link from "next/link";
import { SeloNovo } from "@/componentes/Novidade";
import type { ItemCaixa, MinhaParte, PessoaItem } from "@/lib/caixas";
import FotoItem from "./FotoItem";
import { EtiquetaMeu, NomePessoa, PilulaEtapa, ValorPagamento } from "./PecasItem";

// === Seção: Cartão de um set (item dividido entre várias pessoas) ===
type PropsCartaoSet = {
  item: ItemCaixa;
  eu: Pick<PessoaItem, "nome" | "user">;
  caixaId: number;
};

export default function CartaoSet({ item, eu, caixaId }: PropsCartaoSet) {
  return (
    <article className="cartaoSet">
      {/* === Seção: Fotos === */}
      <div className="cartaoSet__fotos">
        <FotoItem publicId={item.fotoId} descricao={`Foto de ${item.nome}`} className="cartaoSet__foto" />
        <FotoItem publicId={item.proofWhId} descricao={`Balança de ${item.nome}`} className="cartaoSet__foto" />
      </div>

      {/* === Seção: Informações === */}
      <div className="cartaoSet__info">
        {item.grupo && <p className="cartaoSet__grupo">{item.grupo}</p>}
        <h3 className="cartaoSet__nome" title={item.nome}>
          {item.nome}
        </h3>
        <div className="cartaoSet__pilulas">
          <span className="pilulaContorno">{item.qtdPc} PCS</span>
          <span className="pilulaContorno">
            {item.totalPessoas} {item.totalPessoas === 1 ? "joiner" : "joiners"}
          </span>
          <PilulaEtapa situacao={item.situacao} />
          <SeloNovo caixaId={caixaId} atualizadoEm={item.situacaoAtualizadaEm} />
        </div>

        <ul className="cartaoSet__pessoas">
          {item.outrasPessoas.map((pessoa) => (
            <li key={pessoa.userId} className="cartaoSet__pessoa">
              <NomePessoa pessoa={pessoa} />
              <Versoes versoes={pessoa.versoes} />
            </li>
          ))}
        </ul>

        {item.minhasPartes.length > 0 && <MinhasPartes partes={item.minhasPartes} eu={eu} />}
      </div>
    </article>
  );
}

function Versoes({ versoes }: { versoes: (string | null)[] }) {
  return (
    <span className="cartaoSet__versoes">
      {versoes.filter(Boolean).map((versao, indice) => (
        <span key={indice} className="pilulaContorno pilulaContorno__versao">
          {versao}
        </span>
      ))}
    </span>
  );
}

// === Seção: Caixa rosa com as partes do próprio joiner ===
function MinhasPartes({ partes, eu }: { partes: MinhaParte[]; eu: Pick<PessoaItem, "nome" | "user"> }) {
  return (
    <div className="minhasPartes">
      <div className="minhasPartes__topo">
        <EtiquetaMeu />
        <NomePessoa pessoa={eu} />
        <Versoes versoes={partes.map((p) => p.membro)} />
        <Link href="/meus-itens" className="minhasPartes__detalhes">
          Detalhes
        </Link>
      </div>

      <div className="minhasPartes__rolagem">
        <table className="minhasPartes__tabela">
          <thead>
            <tr>
              <th scope="col">MEMBRO</th>
              <th scope="col">VALOR</th>
              <th scope="col">INTER</th>
              <th scope="col">TAXA</th>
            </tr>
          </thead>
          <tbody>
            {partes.map((p) => (
              <tr key={p.id}>
                <td data-rotulo="MEMBRO">{p.membro ?? "-"}</td>
                <td data-rotulo="VALOR">
                  <ValorPagamento valor={p.venda} pago={p.vendaPago} />
                </td>
                <td data-rotulo="INTER">
                  <ValorPagamento valor={p.inter} pago={p.interPago} />
                </td>
                <td data-rotulo="TAXA">
                  <ValorPagamento valor={p.taxa} pago={p.taxaPago} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
