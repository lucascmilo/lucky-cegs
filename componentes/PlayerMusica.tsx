"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PLAYLIST } from "@/lib/configuracoes";
import { IconeAnterior, IconePausa, IconePlay, IconeProxima, IconeVolume } from "./Icones";
import "@/estilos/componentes/PlayerMusica.css";

const VOLUME_INICIAL = 0.15;
// Ao voltar com mais desse tempo tocado, a música recomeça em vez de ir para a anterior
const SEGUNDOS_PARA_RECOMECAR = 3;

function formatarTempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

// === Seção: Player de música da barra superior ===
export default function PlayerMusica() {
  const referenciaAudio = useRef<HTMLAudioElement>(null);
  // Guarda se a nova faixa deve começar a tocar sozinha ao trocar de música
  const continuarTocando = useRef(false);
  const [indiceMusica, setIndiceMusica] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(VOLUME_INICIAL);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);

  const musicaAtual = PLAYLIST[indiceMusica];
  const progresso = duracao > 0 ? (tempoAtual / duracao) * 100 : 0;

  // Recarrega os metadados: a duração pode ter sido lida antes de o React ligar os eventos
  useEffect(() => {
    referenciaAudio.current?.load();
  }, []);

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

  function trocarFaixa(passo: 1 | -1) {
    const audio = referenciaAudio.current;
    // "ended" deixa o áudio pausado, então ao terminar uma faixa a próxima também deve tocar
    continuarTocando.current = Boolean(audio && (!audio.paused || audio.ended));
    setTempoAtual(0);
    setDuracao(0);
    setIndiceMusica((atual) => (atual + passo + PLAYLIST.length) % PLAYLIST.length);
  }

  function voltar() {
    const audio = referenciaAudio.current;
    if (audio && audio.currentTime > SEGUNDOS_PARA_RECOMECAR) {
      audio.currentTime = 0;
      return;
    }
    trocarFaixa(-1);
  }

  function avancarPara(segundos: number) {
    if (referenciaAudio.current) referenciaAudio.current.currentTime = segundos;
    setTempoAtual(segundos);
  }

  return (
    <div className="playerMusica__player">
      {/* === Seção: Áudio === */}
      <audio
        ref={referenciaAudio}
        src={musicaAtual.arquivo}
        preload="metadata"
        onEnded={() => trocarFaixa(1)}
        onPause={() => setTocando(false)}
        onPlay={() => setTocando(true)}
        onTimeUpdate={(evento) => setTempoAtual(evento.currentTarget.currentTime)}
        onDurationChange={(evento) => setDuracao(evento.currentTarget.duration)}
      />

      {/* === Seção: Controles === */}
      <div className="playerMusica__controles">
        <button type="button" className="playerMusica__botaoPular" onClick={voltar} aria-label="Música anterior">
          <IconeAnterior />
        </button>
        <button
          type="button"
          className="playerMusica__botaoTocar"
          onClick={alternarReproducao}
          aria-label={tocando ? "Pausar música" : "Tocar música"}
        >
          {tocando ? <IconePausa tamanho={13} /> : <IconePlay />}
        </button>
        <button type="button" className="playerMusica__botaoPular" onClick={() => trocarFaixa(1)} aria-label="Próxima música">
          <IconeProxima />
        </button>
      </div>

      {/* === Seção: Faixa atual, tempo e progresso === */}
      <div className="playerMusica__faixa">
        <div className="playerMusica__linhaStatus">
          <span className="playerMusica__status">{tocando ? "Tocando" : "Em pausa"}</span>
          <span className="playerMusica__tempo">
            {formatarTempo(tempoAtual)} / {formatarTempo(duracao)}
          </span>
        </div>
        <span className="playerMusica__titulo" title={`${musicaAtual.artista} - ${musicaAtual.titulo}`}>
          {musicaAtual.artista} - {musicaAtual.titulo}
        </span>
        <input
          type="range"
          min={0}
          max={duracao || 0}
          step={0.1}
          value={Math.min(tempoAtual, duracao || 0)}
          onChange={(evento) => avancarPara(Number(evento.target.value))}
          disabled={!duracao}
          className="playerMusica__progresso"
          aria-label="Posição da música"
          aria-valuetext={`${formatarTempo(tempoAtual)} de ${formatarTempo(duracao)}`}
          style={{ "--preenchimento": `${progresso}%` } as CSSProperties}
        />
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
          style={{ "--preenchimento": `${volume * 100}%` } as CSSProperties}
        />
      </label>
    </div>
  );
}
