import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/SeloPedidosAbertos.css";

// === Seção: Forma da estrela explodida (SVG) ===
// Polígono com pontas alternando entre o raio externo (49) e o interno (36), num quadro de 100 × 100.
const QUANTIDADE_PONTAS = 18;

function gerarPontosEstrela() {
  const pontos: string[] = [];
  for (let i = 0; i < QUANTIDADE_PONTAS * 2; i++) {
    const raio = i % 2 === 0 ? 49 : 36;
    const angulo = (Math.PI * i) / QUANTIDADE_PONTAS - Math.PI / 2;
    pontos.push(`${(50 + raio * Math.cos(angulo)).toFixed(2)},${(50 + raio * Math.sin(angulo)).toFixed(2)}`);
  }
  return pontos.join(" ");
}

const PONTOS_ESTRELA = gerarPontosEstrela();

// === Seção: Selo "Pedidos abertos" ===
export default function SeloPedidosAbertos({ className }: { className?: string }) {
  return (
    <div className={juntarClasses("selo", className)} role="img" aria-label="Pedidos abertos">
      <svg className="selo__forma" viewBox="0 0 100 100" aria-hidden="true">
        <polygon points={PONTOS_ESTRELA} />
      </svg>
      <span className="selo__texto" aria-hidden="true">
        PEDIDOS
        <br />
        ABERTOS
      </span>
    </div>
  );
}
