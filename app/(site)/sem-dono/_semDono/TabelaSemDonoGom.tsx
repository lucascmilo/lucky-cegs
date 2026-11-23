"use client";

import { useState, useTransition } from "react";
import { IconeCamera, IconeLixeira, IconeLupa } from "@/componentes/Icones";
import JanelaConfirmar from "@/componentes/JanelaConfirmar";
import JanelaFotos, { temFoto as possuiFoto } from "@/componentes/JanelaFotos";
import { formatarReais, normalizarBusca } from "@/lib/formatacao";
import type { ItemSemDonoGom } from "@/lib/semDonoGom";
import { apagarItemSemDono, darItemSemDono } from "../acoes";
import "@/estilos/componentes/PecasItem.css";

const POR_VEZ = 5;

// === Seção: Tabela de itens sem dono (GOM) ===
// Mostra 5 itens; "Ver mais" mostra mais 5. A busca procura no item, na caixa e em quem pediu.
export default function TabelaSemDonoGom({ itens }: { itens: ItemSemDonoGom[] }) {
  const [busca, setBusca] = useState("");
  const [mostrar, setMostrar] = useState(POR_VEZ);

  const termo = normalizarBusca(busca);
  const encontrados = termo
    ? itens.filter((item) =>
        [item.nome, item.nomeCaixa, ...item.pedidos.map((p) => p.user)].some((texto) =>
          normalizarBusca(texto).includes(termo),
        ),
      )
    : itens;
  const restantes = encontrados.length - mostrar;

  return (
    <>
      <div className="semDono__busca semDonoGom__busca" role="search">
        <IconeLupa className="semDonoGom__iconeBusca" />
        <label className="somenteLeitorTela" htmlFor="busca-sem-dono-gom">
          Buscar item, caixa ou @
        </label>
        <input
          id="busca-sem-dono-gom"
          className="semDono__campoBusca"
          type="search"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value);
            setMostrar(POR_VEZ);
          }}
          placeholder="Buscar item, caixa ou @…"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="semDonoGom">
        <span className="espiralCaderno" aria-hidden="true" />
        <table className="semDonoGom__tabela">
          <thead>
            <tr>
              <th scope="col">Fotos</th>
              <th scope="col">Nome do item</th>
              <th scope="col">Caixa</th>
              <th scope="col">Valor</th>
              <th scope="col">Pedidos de claim</th>
              <th scope="col">Dar para</th>
            </tr>
          </thead>
          <tbody>
            {encontrados.slice(0, mostrar).map((item) => (
              <LinhaItem key={item.id} item={item} />
            ))}
            {encontrados.length === 0 && (
              <tr>
                <td colSpan={6} className="semDonoGom__nada" aria-live="polite">
                  Nada com esse nome. Confira a escrita ou tente outra palavra.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {restantes > 0 && (
          <button
            type="button"
            className="botao botao__contorno semDonoGom__verMais"
            onClick={() => setMostrar((n) => n + POR_VEZ)}
          >
            Ver mais {Math.min(restantes, POR_VEZ)}
            {restantes > POR_VEZ && ` de ${restantes}`}
          </button>
        )}
      </div>
    </>
  );
}

// === Seção: Linha de um item ===
// "Dar item" e "Apagar anúncio" pedem confirmação: nenhum dos dois dá para desfazer.
function LinhaItem({ item }: { item: ItemSemDonoGom }) {
  const [escolhido, setEscolhido] = useState("");
  const [janela, setJanela] = useState<"fotos" | "dar" | "apagar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciarEnvio] = useTransition();
  const joiner = item.pedidos.find((p) => p.userId === escolhido);
  const outros = item.pedidos.length - 1;
  const temFoto = possuiFoto(item);

  function abrir(qual: "dar" | "apagar") {
    setErro(null);
    setJanela(qual);
  }

  function executar(acao: () => Promise<{ ok: true } | { ok: false; erro: string }>) {
    iniciarEnvio(async () => {
      const resultado = await acao();
      if (resultado.ok) setJanela(null);
      else setErro(resultado.erro);
    });
  }

  return (
    <tr>
      <td data-rotulo="Foto">
        <button
          type="button"
          className="botaoCamera"
          onClick={() => setJanela("fotos")}
          disabled={!temFoto}
          aria-label={temFoto ? `Ver fotos de ${item.nome}` : `${item.nome} ainda sem foto`}
          title={temFoto ? "Ver fotos" : "Sem foto ainda"}
        >
          <IconeCamera tamanho={16} />
        </button>
        {janela === "fotos" && <JanelaFotos item={item} aoFechar={() => setJanela(null)} />}
      </td>
      <th scope="row" className="semDonoGom__nome">
        {item.nome}
      </th>
      <td data-rotulo="Caixa">{item.nomeCaixa}</td>
      <td data-rotulo="Valor" className="semDonoGom__valor">
        {item.preco === null ? "A definir" : formatarReais(item.preco)}
      </td>
      <td data-rotulo="Pedidos" className="semDonoGom__pedidos">
        {item.pedidos.length === 0 ? (
          "-"
        ) : (
          <span className="semDonoGom__listaPedidos">
            {item.pedidos.map((pedido) => (
              <span key={pedido.userId}>
                <strong>@{pedido.user}</strong> {pedido.quando}
              </span>
            ))}
          </span>
        )}
      </td>
      <td className="semDonoGom__dar">
        <label className="somenteLeitorTela" htmlFor={`dar-${item.id}`}>
          Dar {item.nome} para
        </label>
        <select
          id={`dar-${item.id}`}
          className="semDonoGom__escolher"
          value={escolhido}
          onChange={(evento) => setEscolhido(evento.target.value)}
          disabled={item.pedidos.length === 0}
        >
          <option value="">{item.pedidos.length === 0 ? "Sem pedidos" : "Escolher joiner"}</option>
          {item.pedidos.map((pedido) => (
            <option key={pedido.userId} value={pedido.userId}>
              @{pedido.user}
            </option>
          ))}
        </select>
        <button type="button" className="semDonoGom__botaoDar" disabled={!joiner} onClick={() => abrir("dar")}>
          Dar item
        </button>
        <button
          type="button"
          className="semDonoGom__apagar"
          onClick={() => abrir("apagar")}
          aria-label={`Apagar o anúncio de ${item.nome}`}
          title="Apagar anúncio (vendido por fora)"
        >
          <IconeLixeira />
        </button>

        {janela === "dar" && joiner && (
          <JanelaConfirmar
            titulo="Dar este item?"
            rotuloConfirmar="Dar item"
            enviando={enviando}
            erro={erro}
            aoCancelar={() => setJanela(null)}
            aoConfirmar={() => executar(() => darItemSemDono(item.id, joiner.userId))}
          >
            <p>
              <strong>{item.nome}</strong> passa a ser de <strong>@{joiner.user}</strong>
              {item.preco !== null && <> por {formatarReais(item.preco)}</>}.
            </p>
            {outros > 0 && (
              <p>{outros === 1 ? "O outro pedido será recusado." : `Os outros ${outros} pedidos serão recusados.`}</p>
            )}
            <p>Não dá para desfazer.</p>
          </JanelaConfirmar>
        )}

        {janela === "apagar" && (
          <JanelaConfirmar
            titulo="Apagar este anúncio?"
            rotuloConfirmar="Apagar anúncio"
            tom="perigo"
            enviando={enviando}
            erro={erro}
            aoCancelar={() => setJanela(null)}
            aoConfirmar={() => executar(() => apagarItemSemDono(item.id))}
          >
            <p>
              <strong>{item.nome}</strong> sai do site.
            </p>
            {item.pedidos.length > 0 && (
              <p>
                {item.pedidos.length === 1
                  ? "O pedido esperando também some."
                  : `Os ${item.pedidos.length} pedidos esperando também somem.`}
              </p>
            )}
            <p>Não dá para desfazer.</p>
          </JanelaConfirmar>
        )}
      </td>
    </tr>
  );
}
