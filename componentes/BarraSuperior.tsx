import { EMAIL_PIX } from "@/lib/configuracoes";
import BotaoCopiar from "./BotaoCopiar";
import PlayerMusica from "./PlayerMusica";
import "@/estilos/componentes/BarraSuperior.css";

// === Seção: Barra superior ===
export default function BarraSuperior() {
  return (
    <div className="barraSuperior">
      <div className="barraSuperior__conteudo">
        {/* === Seção: Pix === */}
        <div className="barraSuperior__pix">
          <span className="barraSuperior__rotuloPix">
            <span className="barraSuperior__marca">LUCKY CEGS | </span>Pix
          </span>
          <span className="barraSuperior__emailPix" title={EMAIL_PIX}>
            {EMAIL_PIX}
          </span>
          <BotaoCopiar texto={EMAIL_PIX} />
        </div>

        {/* === Seção: Player === */}
        <PlayerMusica />
      </div>
    </div>
  );
}