import { juntarClasses } from "@/lib/classes";
import "@/estilos/componentes/EsqueletoPagina.css";

type TipoEsqueleto = "planilha" | "cartoes" | "ficha";

// === Seção: Esqueleto da página enquanto os dados carregam ===
// Mesmo formato da tela que vai aparecer (faixa do topo + conteúdo), para nada pular quando ela chega.
// "planilha": Caixa (resumo e tabela). "cartoes": listas de cartões (Meus itens, Sem dono, Painel…). "ficha": Perfil.
export default function EsqueletoPagina({ tipo }: { tipo: TipoEsqueleto }) {
  return (
    <div className="esqueletoPagina" role="status" aria-live="polite" aria-label="Carregando…">
      <div className="esqueletoPagina__faixa" aria-hidden="true">
        <div className="esqueletoPagina__largura">
          <span className="esqueleto esqueletoPagina__titulo" />
          <span className="esqueleto esqueletoPagina__subtitulo" />
          <div className="esqueletoPagina__pilulas">
            {[0, 1, 2].map((indice) => (
              <span key={indice} className="esqueleto esqueletoPagina__pilula" />
            ))}
          </div>
        </div>
      </div>

      <div className="esqueletoPagina__largura esqueletoPagina__conteudo" aria-hidden="true">
        {tipo === "planilha" && (
          <>
            <span className="esqueleto esqueletoPagina__tituloSecao" />
            <div className="esqueletoPagina__resumo">
              {Array.from({ length: 9 }, (_, indice) => (
                <span key={indice} className="esqueleto esqueletoPagina__quadro" />
              ))}
            </div>
            <span className="esqueleto esqueletoPagina__tituloSecao" />
            <span className="esqueleto esqueletoPagina__barra" />
            <div className="esqueletoPagina__tabela">
              {Array.from({ length: 6 }, (_, indice) => (
                <span key={indice} className="esqueleto esqueletoPagina__linha" />
              ))}
            </div>
          </>
        )}

        {tipo === "cartoes" && (
          <div className="esqueletoPagina__cartoes">
            {Array.from({ length: 6 }, (_, indice) => (
              <span key={indice} className="esqueleto esqueletoPagina__cartao" />
            ))}
          </div>
        )}

        {tipo === "ficha" && (
          <div className="esqueletoPagina__ficha">
            {[0, 1, 2].map((indice) => (
              <div key={indice} className="esqueletoPagina__linhaFicha">
                <span className={juntarClasses("esqueleto", "esqueletoPagina__rotulo")} />
                <span className="esqueleto esqueletoPagina__campo" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}