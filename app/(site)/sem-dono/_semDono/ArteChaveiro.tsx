import Image from "next/image";
import { juntarClasses } from "@/lib/classes";
import chaveiro from "@/public/imagens/chaveiro.png";

type PropsArteChaveiro = {
  // Texto que gira em volta do selo
  texto: string;
  // Id do caminho do texto (único na página)
  id: string;
  // Versão da GOM: fundo rosa e círculo de trevos creme
  gom?: boolean;
};

// === Seção: Selo com texto girando e o chaveiro pendurado no prego ===
export default function ArteChaveiro({ texto, id, gom = false }: PropsArteChaveiro) {
  return (
    <div className={juntarClasses("semDonoVazio__arte", gom && "semDonoVazio__arteGom")} aria-hidden="true">
      <div className="semDonoVazio__selo">
        <svg className="semDonoVazio__anel" viewBox="0 0 240 240">
          <defs>
            <path id={id} d="M 120 120 m -106 0 a 106 106 0 1 1 212 0 a 106 106 0 1 1 -212 0" />
          </defs>
          <text textLength="660" lengthAdjust="spacing">
            <textPath href={`#${id}`}>{`${texto} ★ ${texto} ★ ${texto} ★`}</textPath>
          </text>
        </svg>
        <span className="semDonoVazio__sombra" />
        <span className={juntarClasses("semDonoVazio__circulo", gom && "semDonoVazio__circuloGom fundoTrevosCreme")} />
        <span className="semDonoVazio__prego" />
        <Image src={chaveiro} alt="" unoptimized className="semDonoVazio__chaveiro" />
      </div>
    </div>
  );
}
