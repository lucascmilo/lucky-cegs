import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { obterNotificacoes } from "@/lib/notificacoes";
import { obterUsuarioAtual } from "@/lib/sessao";
import estrelaLogo from "@/public/imagens/estrela-logo.png";
import MenuCabecalho, { MenuCabecalhoComCaminho } from "./MenuCabecalho";
import "@/estilos/componentes/Cabecalho.css";

// === Seção: Menu com a sessão ===
// Lê a sessão no servidor; fica dentro de <Suspense> porque depende dos cookies da requisição.
async function MenuComSessao() {
  const usuario = await obterUsuarioAtual();
  const notificacoes = usuario ? await obterNotificacoes(usuario.id) : null;
  return <MenuCabecalhoComCaminho usuario={usuario} notificacoes={notificacoes} />;
}

// === Seção: Cabeçalho ===
export default function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="cabecalho__conteudo">
        {/* === Seção: Logo === */}
        <Link href="/" className="cabecalho__logo" aria-label="Lucky Cegs, início">
          <Image src={estrelaLogo} alt="" className="cabecalho__estrelaLogo" priority />
          <span>
            LUCKY<span className="cabecalho__logoRosa">CEGS</span>
          </span>
        </Link>

        {/* === Seção: Navegação e conta === */}
        <Suspense fallback={<MenuCabecalho usuario={null} carregando />}>
          <MenuComSessao />
        </Suspense>
      </div>
    </header>
  );
}
