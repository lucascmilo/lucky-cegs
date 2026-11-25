"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { UsuarioAtual } from "@/lib/sessao";
import { IconePerfil, IconeSair, IconeSetaBaixo } from "./Icones";

// === Seção: Menu do usuário logado ===
export default function MenuUsuario({ usuario }: { usuario: UsuarioAtual }) {
  const roteador = useRouter();
  const referenciaMenu = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const inicial = (usuario.nome || usuario.user).trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (!referenciaMenu.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  async function sairDaConta() {
    if (saindo) return;
    setSaindo(true);
    try {
      await authClient.signOut();
      roteador.push("/");
      roteador.refresh();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <div className="cabecalho__menuUsuario" ref={referenciaMenu}>
      {/* === Seção: Botão que abre o menu === */}
      <button
        type="button"
        className="cabecalho__botaoUsuario"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        aria-controls="menu-conta"
        aria-label={`Menu da conta @${usuario.user}`}
      >
        <span className="cabecalho__avatar" aria-hidden="true">
          {inicial}
        </span>
        <span className="cabecalho__arroba">@{usuario.user}</span>
        <IconeSetaBaixo className="cabecalho__setaMenu" aria-hidden="true" />
      </button>

      {/* === Seção: Opções === */}
      {aberto && (
        <div
          className="cabecalho__menuSuspenso"
          id="menu-conta"
          role="menu"
          aria-label={`Opções da conta @${usuario.user}`}
        >
          <Link
            href="/perfil"
            role="menuitem"
            className="cabecalho__opcaoMenu"
            onClick={() => setAberto(false)}
          >
            <IconePerfil aria-hidden="true" />
            Perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className="cabecalho__opcaoMenu"
            onClick={sairDaConta}
            disabled={saindo}
            aria-busy={saindo}
          >
            <IconeSair aria-hidden="true" />
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}