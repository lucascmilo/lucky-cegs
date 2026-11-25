"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "@/estilos/componentes/AvisosTela.css";

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
  const esteveOffline = useRef(false);
  const [voltou, setVoltou] = useState(false);

  useEffect(() => {
    if (!online) {
      esteveOffline.current = true;
      setVoltou(false);
      return;
    }

    if (esteveOffline.current) {
      esteveOffline.current = false;
      setVoltou(true);
    }
  }, [online]);

  useEffect(() => {
    if (!voltou) return;
    const tempo = window.setTimeout(() => setVoltou(false), 4000);
    return () => window.clearTimeout(tempo);
  }, [voltou]);

  return (
    <p className="avisoConexao" role="status" aria-live="polite">
      {!online && (
        <span className="avisoConexao__faixa">Sem internet. Para salvar, espere a conexão voltar.</span>
      )}
      {online && voltou && (
        <span className="avisoConexao__faixa avisoConexao__voltou">Conexão de volta.</span>
      )}
    </p>
  );
}