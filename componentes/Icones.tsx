// === Seção: Tipos ===
type PropsIcone = {
  className?: string;
  tamanho?: number;
};

// === Seção: Ícone de copiar ===
export function IconeCopiar({ className, tamanho = 14 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 3.5v-.4A1.6 1.6 0 0 0 8.9 1.5H4.1A1.6 1.6 0 0 0 2.5 3.1v4.8a1.6 1.6 0 0 0 1.6 1.6h.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// === Seção: Ícones do player ===
export function IconePlay({ className, tamanho = 14 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.1 2.2v7.6c0 .4.4.6.7.4l5.5-3.8a.5.5 0 0 0 0-.8L3.8 1.8c-.3-.2-.7 0-.7.4Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function IconePausa({ className, tamanho = 12 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2.3" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" />
      <rect x="7.1" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" />
    </svg>
  );
}

export function IconeAnterior({ className, tamanho = 12 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M10 2.4v7.2c0 .4-.4.6-.7.4L4.1 6.4a.5.5 0 0 1 0-.8l5.2-3.6c.3-.2.7 0 .7.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2 2.2v7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeProxima({ className, tamanho = 12 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2.4v7.2c0 .4.4.6.7.4l5.2-3.6a.5.5 0 0 0 0-.8L2.7 2c-.3-.2-.7 0-.7.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M10 2.2v7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeVolume({ className, tamanho = 13, mudo = false }: PropsIcone & { mudo?: boolean }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2V6Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      {mudo ? (
        <path d="m11 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

// === Seção: Seta para a direita ===
export function IconeSeta({ className, tamanho = 16 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Seção: Ícones do menu do usuário ===
export function IconeSetaBaixo({ className, tamanho = 12 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconePerfil({ className, tamanho = 16 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 14c.5-2.6 2.6-4.2 5.2-4.2s4.7 1.6 5.2 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconeSair({ className, tamanho = 16 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9.5 2.5H4.3c-.9 0-1.6.7-1.6 1.6v7.8c0 .9.7 1.6 1.6 1.6h5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 8h6.5m0 0-2.4-2.4M13.5 8l-2.4 2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Seção: Ícone de menu ===
export function IconeMenu({ className, tamanho = 20, aberto = false }: PropsIcone & { aberto?: boolean }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {aberto ? (
        <path d="m4.5 4.5 11 11m0-11-11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

// === Seção: Ícones de mostrar senha ===
export function IconeOlho({ className, tamanho = 18, riscado = false }: PropsIcone & { riscado?: boolean }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.8 10S4.8 4.2 10 4.2 18.2 10 18.2 10 15.2 15.8 10 15.8 1.8 10 1.8 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      {riscado && <path d="M3.5 16.5 16.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

// === Seção: Ícones da tela de caixa ===
export function IconeLupa({ className, tamanho = 18 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.6" cy="8.6" r="5.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m12.8 12.8 4.4 4.4M8.6 6.4v4.4M6.4 8.6h4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCoracao({ className, tamanho = 12 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 14.2S1.5 10.3 1.5 5.7A3.4 3.4 0 0 1 8 4.2a3.4 3.4 0 0 1 6.5 1.5c0 4.6-6.5 8.5-6.5 8.5Z" fill="currentColor" />
    </svg>
  );
}

export function IconeCheck({ className, tamanho = 10 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="m2.2 6.4 2.4 2.4 5.2-5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeRelogio({ className, tamanho = 10 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 3.6V6l1.6 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeFechar({ className, tamanho = 18 }: PropsIcone) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
