"use client";

import { useState } from "react";
import AvisoFlutuante from "@/componentes/AvisoFlutuante";
import JanelaCaixa from "./JanelaCaixa";
import "@/estilos/paginas/CaixaGom.css";

// === Seção: "+ Nova caixa" quando ainda não existe nenhuma caixa ===
export default function BotaoNovaCaixa({ abrir }: { abrir: boolean }) {
  const [aberta, setAberta] = useState(abrir);
  return (
    <>
      <button type="button" className="botao botao__rosa" onClick={() => setAberta(true)}>
        + Nova caixa
      </button>
      {aberta && <JanelaCaixa caixas={[]} aoFechar={() => setAberta(false)} />}
      <AvisoFlutuante />
    </>
  );
}