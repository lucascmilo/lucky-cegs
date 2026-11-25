import Link from "next/link";

// === Seção: Chegou na casa da GOM ===
export default function SecaoCasaDaGom() {
  return (
    <section className="inicioJoiner__faixa inicioJoiner__faixaCoracoes">
      <div className="inicioJoiner__cartao inicioJoiner__cartaoCasa">
        <div>
          <h2 className="inicioJoiner__titulo">
            CHEGOU NA
            <span className="inicioJoiner__tituloRosa">CASA DA GOM</span>
          </h2>
          <p className="inicioJoiner__texto">
            Quando a caixa chega, a GOM tira uma foto com todos
            <br />
            os seus itens juntos e a foto fica guardada no seu fichário.
          </p>
        </div>

        <div className="inicioJoiner__botoesCasa">
          <Link href="/casa-da-gom" className="botao botao__preto">
            Abrir meu fichário
          </Link>
          <Link href="/sem-dono" className="botao botao__contorno">
            Ver itens sem dono
          </Link>
        </div>
      </div>
    </section>
  );
}