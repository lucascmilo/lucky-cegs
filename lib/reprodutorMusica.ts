import { useSyncExternalStore } from "react";
import { PLAYLIST } from "@/lib/configuracoes";

// === Seção: Reprodutor de música único do site ===
// O Next mantém páginas visitadas escondidas na memória, cada uma com uma cópia do player.
// Por isso o áudio vive aqui, fora do React: um só para o site, e os players só o controlam.

const VOLUME_INICIAL = 0.05;
// Ao voltar com mais desse tempo tocado, a música recomeça em vez de ir para a anterior
const SEGUNDOS_PARA_RECOMECAR = 3;

type EstadoReprodutor = {
  indice: number;
  tocando: boolean;
  tempoAtual: number;
  duracao: number;
  volume: number;
  mudo: boolean;
};

const ESTADO_INICIAL: EstadoReprodutor = {
  indice: 0,
  tocando: false,
  tempoAtual: 0,
  duracao: 0,
  volume: VOLUME_INICIAL,
  mudo: false,
};

// Guardado na janela (e não no módulo) para sobreviver a recargas de código no dev.
type Registro = {
  audio: HTMLAudioElement | null;
  estado: EstadoReprodutor;
  reproducaoAutomaticaIniciada: boolean;
  ouvintes: Set<() => void>;
  // undefined = ainda não criado; null = navegador sem suporte
  canal?: BroadcastChannel | null;
};

function obterRegistro() {
  const janela = globalThis as typeof globalThis & { __reprodutorLuckyCegs?: Registro };
  janela.__reprodutorLuckyCegs ??= {
    audio: null,
    estado: ESTADO_INICIAL,
    reproducaoAutomaticaIniciada: false,
    ouvintes: new Set(),
  };
  return janela.__reprodutorLuckyCegs;
}

function atualizarEstado(mudancas: Partial<EstadoReprodutor>) {
  const registro = obterRegistro();
  registro.estado = { ...registro.estado, ...mudancas };
  registro.ouvintes.forEach((ouvinte) => ouvinte());
}

// === Seção: Conversa entre abas ===
// Só uma aba toca por vez. Mensagens: "tocando", "alguem-tocando?" e a resposta "sim".
function obterCanal() {
  const registro = obterRegistro();
  if (registro.canal !== undefined) return registro.canal;
  if (typeof BroadcastChannel === "undefined") return (registro.canal = null);

  const canal = new BroadcastChannel("lucky-cegs-musica");
  canal.addEventListener("message", (evento) => {
    const audio = registro.audio;
    if (evento.data === "tocando") audio?.pause();
    if (evento.data === "alguem-tocando?" && audio && !audio.paused) canal.postMessage("sim");
  });
  return (registro.canal = canal);
}

function outraAbaEstaTocando() {
  const canal = obterCanal();
  if (!canal) return Promise.resolve(false);
  return new Promise<boolean>((responder) => {
    const aoResponder = (evento: MessageEvent) => {
      if (evento.data !== "sim") return;
      canal.removeEventListener("message", aoResponder);
      responder(true);
    };
    canal.addEventListener("message", aoResponder);
    canal.postMessage("alguem-tocando?");
    setTimeout(() => {
      canal.removeEventListener("message", aoResponder);
      responder(false);
    }, 250);
  });
}

// === Seção: Áudio (criado uma única vez, só no navegador) ===
function obterAudio() {
  const registro = obterRegistro();
  if (registro.audio) return registro.audio;

  const audio = new Audio(PLAYLIST[registro.estado.indice].arquivo);
  audio.preload = "metadata";
  audio.volume = registro.estado.volume;
  audio.addEventListener("play", () => {
    obterCanal()?.postMessage("tocando");
    atualizarEstado({ tocando: true });
  });
  audio.addEventListener("pause", () => atualizarEstado({ tocando: false }));
  audio.addEventListener("timeupdate", () => atualizarEstado({ tempoAtual: audio.currentTime }));
  audio.addEventListener("durationchange", () => atualizarEstado({ duracao: audio.duration }));
  audio.addEventListener("ended", () => trocarFaixa(1, true));
  registro.audio = audio;
  return audio;
}

function tocar() {
  obterAudio()
    .play()
    .catch(() => atualizarEstado({ tocando: false }));
}

// === Seção: Ações ===
export function alternarReproducao() {
  const elemento = obterAudio();
  if (elemento.paused) tocar();
  else elemento.pause();
}

export function trocarFaixa(passo: 1 | -1, continuar?: boolean) {
  const elemento = obterAudio();
  const deveTocar = continuar ?? !elemento.paused;
  const indice = (obterRegistro().estado.indice + passo + PLAYLIST.length) % PLAYLIST.length;

  elemento.src = PLAYLIST[indice].arquivo;
  atualizarEstado({ indice, tempoAtual: 0, duracao: 0 });
  if (deveTocar) tocar();
}

export function voltarFaixa() {
  const elemento = obterAudio();
  if (elemento.currentTime > SEGUNDOS_PARA_RECOMECAR) {
    elemento.currentTime = 0;
    return;
  }
  trocarFaixa(-1);
}

export function avancarPara(segundos: number) {
  obterAudio().currentTime = segundos;
  atualizarEstado({ tempoAtual: segundos });
}

// Mexer no volume tira o silêncio
export function definirVolume(volume: number) {
  const elemento = obterAudio();
  elemento.volume = volume;
  elemento.muted = false;
  atualizarEstado({ volume, mudo: false });
}

// No iPhone o volume do site não muda (é sempre o do aparelho), mas silenciar funciona
export function alternarMudo() {
  const elemento = obterAudio();
  elemento.muted = !elemento.muted;
  atualizarEstado({ mudo: elemento.muted });
}

// === Seção: Começar a tocar ao abrir o site (uma vez só) ===
// Se o navegador bloquear o som, começa no primeiro clique ou tecla fora do player.
// Não começa se outra aba do site já estiver tocando.
export async function iniciarReproducaoAutomatica() {
  const registro = obterRegistro();
  if (registro.reproducaoAutomaticaIniciada) return;
  registro.reproducaoAutomaticaIniciada = true;
  if (await outraAbaEstaTocando()) return;

  const eventos = ["pointerdown", "keydown"] as const;
  function tocarNaPrimeiraInteracao(evento: Event) {
    eventos.forEach((nome) => document.removeEventListener(nome, tocarNaPrimeiraInteracao, true));
    const alvo = evento.target as Element | null;
    if (alvo?.closest?.("[data-player-musica]")) return;
    if (obterAudio().paused) tocar();
  }

  obterAudio()
    .play()
    .catch(() => {
      eventos.forEach((nome) => document.addEventListener(nome, tocarNaPrimeiraInteracao, true));
    });
}

// === Seção: Hook para os componentes acompanharem o estado ===
function inscrever(ouvinte: () => void) {
  const { ouvintes } = obterRegistro();
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function useReprodutorMusica() {
  return useSyncExternalStore(
    inscrever,
    () => obterRegistro().estado,
    () => ESTADO_INICIAL,
  );
}
