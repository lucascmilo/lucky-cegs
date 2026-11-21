"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PLAYLIST } from "@/lib/configuracoes";
import { IconePausa, IconePlay, IconeVolume } from "./Icones";
import "@/estilos/componentes/PlayerMusica.css";

const VOLUME_INICIAL = 0.15;

// === Seção: Player de música da barra superior ===
export default function PlayerMusica() {
  const referenciaAudio = useRef<HTMLAudioElement>(null);
  // Guarda se a próxima faixa deve começar a tocar sozinha ao trocar de música
  const continuarTocando = useRef(false);
  const [indiceMusica, setIndiceMusica] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(VOLUME_INICIAL);

  const musicaAtual = PLAYLIST[indiceMusica];

  // Mantém o volume do elemento de áudio igual ao do controle
  useEffect(() => {
    if (referenciaAudio.current) referenciaAudio.current.volume = volume;
  }, [volume]);

  // Depois de trocar a faixa, retoma a reprodução se a música anterior estava tocando
  useEffect(() => {
    if (!continuarTocando.current) return;
    continuarTocando.current = false;
    referenciaAudio.current?.play().catch(() => setTocando(false));
  }, [indiceMusica]);

  async function alternarReproducao() {
    const audio = referenciaAudio.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play().catch(() => setTocando(false));
    } else {
      audio.pause();
    }
  }

  function tocarProxima() {
    const audio = referenciaAudio.current;
    // "ended" deixa o áudio pausado, então ao terminar uma faixa a próxima também deve tocar
    continuarTocando.current = Boolean(audio && (!audio.paused || audio.ended));
    setIndiceMusica((atual) => (atual + 1) % PLAYLIST.length);
  }

  return (
    <div className="playerMusica__player">
      {/* === Seção: Áudio (o estado "tocando" acompanha os eventos do próprio elemento) === */}
      <audio
        ref={referenciaAudio}
        src={musicaAtual.arquivo}
        preload="none"
        onEnded={tocarProxima}
        onPause={() => setTocando(false)}
        onPlay={() => setTocando(true)}
      />

      {/* === Seção: Botão tocar/pausar === */}
      <button
        type="button"
        className="playerMusica__botaoTocar"
        onClick={alternarReproducao}
        aria-label={tocando ? "Pausar música" : "Tocar música"}
      >
        {tocando ? <IconePausa tamanho={13} /> : <IconePlay />}
      </button>

      {/* === Seção: Faixa atual (clicar no nome pula para a próxima música) === */}
      <div className="playerMusica__faixa">
        <span className="playerMusica__status">{tocando ? "Tocando" : "Em pausa"}</span>
        <button
          type="button"
          className="playerMusica__titulo"
          onClick={tocarProxima}
          title="Próxima música"
          aria-label={`${musicaAtual.artista} - ${musicaAtual.titulo}. Clique para a próxima música`}
        >
          {musicaAtual.artista} - {musicaAtual.titulo}
        </button>
      </div>

      {/* === Seção: Volume === */}
      <label className="playerMusica__volume">
        <IconeVolume mudo={volume === 0} className="playerMusica__iconeVolume" />
        <span className="somenteLeitorTela">Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(evento) => setVolume(Number(evento.target.value))}
          className="playerMusica__controleVolume"
          // A parte rosa da barra acompanha o volume
          style={{ "--preenchimento": `${volume * 100}%` } as CSSProperties}
        />
      </label>
    </div>
  );
}
