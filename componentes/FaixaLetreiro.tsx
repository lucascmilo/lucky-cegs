import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/FaixaLetreiro.css";

// === Seção: Tipos ===
type PropsFaixaLetreiro = {
  variante: "rosa" | "preta";
  className?: string;
};

const FRASES = ["LUCKY CEGS", "PEDIDOS ABERTOS", "PHOTOCARDS, ÁLBUNS LEVES, CACARECOS"];

// === Seção: Grupo de frases ===
// Repetido duas vezes para a animação dar a volta sem emenda.
function GrupoFrases({ oculto = false }: { oculto?: boolean }) {
  return (
    <span className="faixaLetreiro__grupo" aria-hidden={oculto || undefined}>
      {FRASES.map((frase) => (
        <span key={frase} className="faixaLetreiro__item">
          {frase}
          <span className="faixaLetreiro__estrela" aria-hidden="true">
            ☆
          </span>
        </span>
      ))}
    </span>
  );
}

// === Seção: Faixa com letreiro em movimento ===
export default function FaixaLetreiro({ variante, className }: PropsFaixaLetreiro) {
  return (
    <div className={juntarClasses("faixaLetreiro__faixa", `faixaLetreiro__${variante}`, className)}>
      <div className="faixaLetreiro__trilho">
        <GrupoFrases />
        <GrupoFrases oculto />
      </div>
    </div>
  );
}