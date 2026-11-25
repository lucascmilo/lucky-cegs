import "@/estilos/componentes/Carregando.css";

// Mesma folha do logo-trevo.svg: as quatro folhas são o mesmo desenho girado
const FOLHA =
  "M0,0 C-7,-7 -22,-17 -22,-30 C-22,-40 -15,-46 -9,-46 C-4,-46 -1,-43 0,-39 C1,-43 4,-46 9,-46 C15,-46 22,-40 22,-30 C22,-17 7,-7 0,0 Z";
// A ordem das folhas acende em volta do trevo; a de baixo à esquerda (225°) é a folha de destaque preta
const FOLHAS = [315, 45, 135, 225];

// === Seção: Tela de carregamento (usada no loading.tsx e nos Suspense das páginas) ===
// Página de caderno com espiral e moldura de seleção; as folhas do trevo acendem uma por vez
export default function Carregando() {
  return (
    <div className="carregando" role="status" aria-live="polite">
      <div className="carregando__pagina" aria-hidden="true">
        <div className="carregando__moldura">
          <span className="carregando__alca carregando__alcaUm" />
          <span className="carregando__alca carregando__alcaDois" />
          <span className="carregando__alca carregando__alcaTres" />
          <span className="carregando__alca carregando__alcaQuatro" />
          <svg
            className="carregando__trevo"
            viewBox="-56 -56 112 112"
            focusable="false"
          >
            {FOLHAS.map((angulo, ordem) => (
              <path
                key={angulo}
                d={FOLHA}
                transform={`rotate(${angulo}) translate(0,-3)`}
                className={
                  angulo === 225
                    ? "carregando__folha carregando__folhaDestaque"
                    : "carregando__folha"
                }
                style={{ animationDelay: `${ordem * 0.25}s` }}
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="carregando__texto">
        CARREGANDO
        <span className="carregando__pontos" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}