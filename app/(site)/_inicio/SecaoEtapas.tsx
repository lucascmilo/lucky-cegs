import { ETAPAS_ITEM } from "@/lib/etapas";

// === Seção: Do pedido até você ===
export default function SecaoEtapas() {
  return (
    <section className="inicioJoiner__faixa fundoTrevosRosa">
      <div className="inicioJoiner__cartao inicioJoiner__cartaoEtapas">
        <div className="inicioJoiner__textoEtapas">
          <h2 className="inicioJoiner__titulo">
            DO PEDIDO
            <span className="inicioJoiner__tituloRosa">ATÉ VOCÊ</span>
          </h2>
          <p className="inicioJoiner__texto">
            Todo pedido passa por essas seis etapas.
            <br />
            Em cada item seu aparece em qual delas ele está.
          </p>
        </div>

        <ol className="inicioJoiner__etapas">
          {ETAPAS_ITEM.map((etapa, indice) => (
            <li key={etapa.id}>
              <span className="inicioJoiner__numeroEtapa" aria-hidden="true">
                {String(indice + 1).padStart(2, "0")}
              </span>
              {etapa.rotulo}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}