"use client";

import { useEffect, type CSSProperties } from "react";
import { PLAYLIST } from "@/lib/configuracoes";
import {
  alternarMudo,
  alternarReproducao,
  avancarPara,
  definirVolume,
  iniciarReproducaoAutomatica,
  trocarFaixa,
  useReprodutorMusica,
  voltarFaixa,
} from "@/lib/reprodutorMusica";
import { IconeAnterior, IconePausa, IconePlay, IconeProxima, IconeVolume } from "./Icones";
import "@/estilos/componentes/PlayerMusica.css";

function formatarTempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

// === Seção: Player de música da barra superior ===
// Só controla o áudio único do site (lib/reprodutorMusica), sem ter um áudio próprio.
export default function PlayerMusica() {
  const { indice, tocando, tempoAtual, duracao, volume, mudo } = useReprodutorMusica();
  const semSom = mudo || volume === 0;
  const musicaAtual = PLAYLIST[indice];
  const progresso = duracao > 0 ? (tempoAtual / duracao) * 100 : 0;
  const percentualVolume = Math.round((mudo ? 0 : volume) * 100);

  useEffect(() => {
    iniciarReproducaoAutomatica();
  }, []);

  return (
    <div className="playerMusica__player" data-player-musica>
      {/* === Seção: Controles === */}
      <div className="playerMusica__controles">
        <button
          type="button"
          className="playerMusica__botaoPular"
          onClick={voltarFaixa}
          aria-label="Música anterior"
        >
          <IconeAnterior aria-hidden="true" />
        </button>
        <button
          type="button"
          className="playerMusica__botaoTocar"
          onClick={alternarReproducao}
          aria-label={tocando ? "Pausar música" : "Tocar música"}
        >
          {tocando ? (
            <IconePausa tamanho={13} aria-hidden="true" />
          ) : (
            <IconePlay aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="playerMusica__botaoPular"
          onClick={() => trocarFaixa(1)}
          aria-label="Próxima música"
        >
          <IconeProxima aria-hidden="true" />
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
        <span
          className="playerMusica__titulo"
          title={`${musicaAtual.artista} - ${musicaAtual.titulo}`}
        >
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
      <div className="playerMusica__volume">
        <button
          type="button"
          className="playerMusica__botaoMudo"
          onClick={alternarMudo}
          aria-label={mudo ? "Ligar o som" : "Tirar o som"}
          aria-pressed={mudo}
        >
          <IconeVolume
            mudo={semSom}
            className="playerMusica__iconeVolume"
            aria-hidden="true"
          />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(evento) => definirVolume(Number(evento.target.value))}
          className="playerMusica__controleVolume"
          aria-label="Volume"
          aria-valuetext={`${percentualVolume}%`}
          style={{ "--preenchimento": `${mudo ? 0 : volume * 100}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}