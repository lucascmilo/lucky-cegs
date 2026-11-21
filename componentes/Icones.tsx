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
      {/* Triângulo com a caixa centralizada no círculo e leve ajuste óptico para a direita */}
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

// === Seção: Ícone de menu (mobile) ===
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
