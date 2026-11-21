import Link from "next/link";
import { IconeSeta } from "@/componentes/Icones";
import { formatarReais } from "@/lib/formatacao";

// === Seção: Ações do joiner no hero ===
// faltaPagar null = valor ainda carregando
export default function AcoesJoiner({ faltaPagar }: { faltaPagar: number | null }) {
  return (
    <div className="inicio__acoes">
      <div className="inicio__botoes">
        <Link href="/caixas" className="botao botao__rosa">
          Ver minhas caixas
        </Link>
        <Link href="/meus-itens" className="botao botao__contorno">
          Meus itens
        </Link>
      </div>

      <Link href="/meus-itens" className="inicio__faltaPagar">
        <span className="inicio__faltaPagarTexto">
          <span className="inicio__faltaPagarRotulo">Falta pagar</span>
          {faltaPagar === null ? (
            <span className="esqueleto inicio__faltaPagarEsqueleto">
              <span className="somenteLeitorTela">Carregando valor</span>
            </span>
          ) : (
            <strong className="inicio__faltaPagarValor">{formatarReais(faltaPagar)}</strong>
          )}
        </span>
        <IconeSeta tamanho={20} />
      </Link>
    </div>
  );
}
