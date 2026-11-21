import Image from "next/image";
import estrelaLogo from "@/public/imagens/estrela-logo.png";
import "@/estilos/componentes/Carregando.css";

// === Seção: Tela de carregamento das páginas do site ===
export default function Carregando() {
  return (
    <div className="carregando" role="status">
      <div className="carregando__cartas" aria-hidden="true">
        <span className="carregando__carta carregando__cartaUm" />
        <span className="carregando__carta carregando__cartaDois" />
        <span className="carregando__carta carregando__cartaTres">
          <Image src={estrelaLogo} alt="" className="carregando__estrela" />
        </span>
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
