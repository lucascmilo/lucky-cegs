import Link from "next/link";
import { FotosDoItem } from "@/componentes/FotoItem";
import { IconeCheck } from "@/componentes/Icones";
import { BotaoDetalhes } from "@/componentes/JanelaDetalhes";
import { SeloNovo } from "@/componentes/Novidade";
import { EtiquetaMeu, NomePessoa, PilulaEtapa } from "@/componentes/PecasItem";
import TextoCortado from "@/componentes/TextoCortado";
import type { ItemCaixa } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import { formatarReais } from "@/lib/formatacao";

export const CARTOES_POR_VEZ = 4;

type PropsPedidosIndividuais = {
  itens: ItemCaixa[];
  caixaId: number;
  // Quantos cartões mostrar (vem do endereço, para não se perder ao recarregar)
  mostrar: number;
  enderecoVerMais: string;
};

// === Seção: Pedidos individuais ("Ver mais" mostra mais 4) ===
export default function PedidosIndividuais({
  itens,
  caixaId,
  mostrar,
  enderecoVerMais,
}: PropsPedidosIndividuais) {
  const restantes = Math.max(0, itens.length - mostrar);

  return (
    <>
      <ul className="pedidosIndividuais__lista">
        {itens.slice(0, mostrar).map((item) => (
          <li key={item.id}>
            <CartaoIndividual item={item} caixaId={caixaId} />
          </li>
        ))}
      </ul>

      {restantes > 0 && (
        <Link
          href={enderecoVerMais}
          scroll={false}
          className="botao botao__contorno pedidosIndividuais__verMais"
        >
          Ver mais {restantes} {restantes === 1 ? "item" : "itens"}
        </Link>
      )}
    </>
  );
}

// === Seção: Cartão de um pedido individual ===
function CartaoIndividual({ item, caixaId }: { item: ItemCaixa; caixaId: number }) {
  const meu = item.minhasPartes.length > 0;

  return (
    <article className={juntarClasses("cartaoIndividual", meu && "cartaoIndividual__meu")}>
      {meu && <EtiquetaMeu className="cartaoIndividual__etiqueta" />}

      <FotosDoItem
        item={item}
        className="cartaoIndividual__fotos"
        classeFoto="cartaoIndividual__foto"
      />

      <h3 className="cartaoIndividual__nome">
        <TextoCortado texto={item.nome} />
      </h3>
      {item.dono && (
        <p className="cartaoIndividual__dono">
          <NomePessoa pessoa={item.dono} />
        </p>
      )}
      <div className="cartaoIndividual__etapa">
        <PilulaEtapa situacao={item.situacao} />
        <SeloNovo caixaId={caixaId} atualizadoEm={item.situacaoAtualizadaEm} />
      </div>

      {meu && (
        <div className="cartaoIndividual__rodape">
          {item.faltaPagar > 0 ? (
            <span className="cartaoIndividual__falta">Falta {formatarReais(item.faltaPagar)}</span>
          ) : (
            <span className="cartaoIndividual__falta cartaoIndividual__tudoPago">
              <IconeCheck tamanho={11} aria-hidden="true" /> Pago
            </span>
          )}
          <BotaoDetalhes itemId={item.id} className="cartaoIndividual__detalhes" />
        </div>
      )}
    </article>
  );
}