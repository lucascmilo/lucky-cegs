import Image from "next/image";
import type { ReactNode } from "react";
import carimboPostal from "@/public/imagens/carimbo-postal.png";

type PropsCartaoPostalVazio = {
  legendaFoto: string;
  // Carimbo de borracha em duas linhas (ex.: ["AGUARDANDO", "ENTREGA"])
  carimbo: [string, string];
  titulo: string;
  cursiva: string;
  descricao: string;
  acoes: ReactNode;
};

// === Seção: Cartão-postal ainda sem foto (aviso de lista vazia) ===
// Usa os estilos do cartão-postal (CasaDaGom.css)
export default function CartaoPostalVazio({
  legendaFoto,
  carimbo,
  titulo,
  cursiva,
  descricao,
  acoes,
}: PropsCartaoPostalVazio) {
  return (
    <div className="postal postalVazio" role="status">
      <div className="postal__borda">
        <div className="postal__ladoFoto postalVazio__espacoFoto" aria-hidden="true">
          <span className="postalVazio__polaroide">
            <span className="postalVazio__polaroideFoto" />
          </span>
          <span className="postalVazio__legendaFoto">{legendaFoto}</span>
          <span className="postalVazio__carimbo">
            {carimbo[0]}
            <br />
            {carimbo[1]}
          </span>
        </div>

        <span className="postal__linha" aria-hidden="true" />

        <div className="postal__texto">
          <p className="postal__marca">LUCKY CEGS · POST CARD CO.</p>
          <h2 className="postalVazio__titulo">{titulo}</h2>
          <p className="postal__cursiva">{cursiva}</p>
          <p className="postalVazio__descricao">{descricao}</p>
          <div className="postalVazio__acoes">{acoes}</div>
        </div>

        <Image src={carimboPostal} alt="" sizes="150px" className="postal__carimbo" />
      </div>
    </div>
  );
}
