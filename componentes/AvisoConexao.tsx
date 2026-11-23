"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import "@/estilos/componentes/AvisoConexao.css";

function inscrever(avisar: () => void) {
  window.addEventListener("online", avisar);
  window.addEventListener("offline", avisar);
  return () => {
    window.removeEventListener("online", avisar);
    window.removeEventListener("offline", avisar);
  };
}

// === Seção: Faixa de "sem internet" ===
// Aparece no topo enquanto a conexão estiver fora; quando volta, mostra "Conexão de volta" por alguns segundos.
export default function AvisoConexao() {
  const online = useSyncExternalStore(
    inscrever,
    () => navigator.onLine,
    () => true,
  );
  const [voltou, setVoltou] = useState(false);
  const [caiu, setCaiu] = useState(false);

  if (!online && !caiu) setCaiu(true);
  if (online && caiu) {
    setCaiu(false);
    setVoltou(true);
  }

  useEffect(() => {
    if (!voltou) return;
    const tempo = window.setTimeout(() => setVoltou(false), 4000);
    return () => window.clearTimeout(tempo);
  }, [voltou]);

  return (
    <p className="avisoConexao" role="status">
      {!online && (
        <span className="avisoConexao__faixa">Sem internet. Para salvar, espere a conexão voltar.</span>
      )}
      {online && voltou && <span className="avisoConexao__faixa avisoConexao__voltou">Conexão de volta.</span>}
    </p>
  );
}
