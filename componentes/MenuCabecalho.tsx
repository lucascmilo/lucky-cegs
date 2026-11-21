"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { juntarClasses } from "@/lib/classes";
import { obterLinksNavegacao } from "@/lib/navegacao";
import type { UsuarioAtual } from "@/lib/sessao";
import coracaoBranco from "@/public/imagens/coracao-branco.png";
import { IconeMenu } from "./Icones";
import "@/estilos/componentes/Cabecalho.css";

// === Seção: Tipos ===
type PropsMenuCabecalho = {
  usuario: UsuarioAtual | null;
  // Enquanto a sessão carrega, o botão de conta fica invisível (sem piscar "Entrar")
  carregando?: boolean;
};

// === Seção: Menu do cabeçalho (links + conta) ===
export default function MenuCabecalho({ usuario, carregando = false }: PropsMenuCabecalho) {
  const caminhoAtual = usePathname();
  const roteador = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const links = obterLinksNavegacao(usuario?.papel ?? null);

  // "/" só fica ativo na própria página inicial; os demais também nas subpáginas
  function linkEstaAtivo(destino: string) {
    return destino === "/" ? caminhoAtual === "/" : caminhoAtual.startsWith(destino);
  }

  async function sairDaConta() {
    setSaindo(true);
    await authClient.signOut();
    roteador.push("/");
    roteador.refresh();
    setSaindo(false);
  }

  return (
    <>
      {/* === Seção: Botão do menu mobile === */}
      <button
        type="button"
        className="cabecalho__botaoMenu"
        onClick={() => setMenuAberto((aberto) => !aberto)}
        aria-expanded={menuAberto}
        aria-controls="navegacao-principal"
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
      >
        <IconeMenu aberto={menuAberto} />
      </button>

      {/* === Seção: Links de navegação === */}
      <nav
        id="navegacao-principal"
        className={juntarClasses("cabecalho__navegacao", menuAberto && "cabecalho__navegacaoAberta")}
        aria-label="Navegação principal"
      >
        <ul className="cabecalho__listaLinks">
          {links.map((link) => {
            const ativo = linkEstaAtivo(link.destino);
            return (
              <li key={link.destino}>
                <Link
                  href={link.destino}
                  onClick={() => setMenuAberto(false)}
                  className={juntarClasses("cabecalho__link", ativo && "cabecalho__linkAtivo")}
                  aria-current={ativo ? "page" : undefined}
                >
                  {link.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* === Seção: Conta (entrar / sair) === */}
      <div className={juntarClasses("cabecalho__conta", carregando && "cabecalho__contaCarregando")}>
        {usuario ? (
          <button type="button" className="cabecalho__botaoConta" onClick={sairDaConta} disabled={saindo}>
            <span className="cabecalho__circuloCoracao">
              <Image src={coracaoBranco} alt="" className="cabecalho__coracaoBotao" />
            </span>
            <span className="cabecalho__textoConta">
              <span className="cabecalho__nomeUsuario">@{usuario.user}</span>
              <span>{saindo ? "Saindo..." : "Sair"}</span>
            </span>
          </button>
        ) : (
          <Link href="/entrar" className="cabecalho__botaoConta">
            <span className="cabecalho__circuloCoracao">
              <Image src={coracaoBranco} alt="" className="cabecalho__coracaoBotao" />
            </span>
            <span>Entrar</span>
          </Link>
        )}
      </div>
    </>
  );
}
