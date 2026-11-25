// === Seção: Forma da estrela explodida ===
const QUANTIDADE_PONTAS = 18;
const CENTRO_X = 50;
const CENTRO_Y = 50;
const RAIO_EXTERNO = 49;
const RAIO_INTERNO = 36;

function gerarPontosEstrela() {
  const pontos: string[] = [];
  for (let i = 0; i < QUANTIDADE_PONTAS * 2; i++) {
    const raio = i % 2 === 0 ? RAIO_EXTERNO : RAIO_INTERNO;
    const angulo = (Math.PI * i) / QUANTIDADE_PONTAS - Math.PI / 2;
    const x = (CENTRO_X + raio * Math.cos(angulo)).toFixed(2);
    const y = (CENTRO_Y + raio * Math.sin(angulo)).toFixed(2);
    pontos.push(`${x},${y}`);
  }
  return pontos.join(" ");
}

export const PONTOS_ESTRELA = gerarPontosEstrela();