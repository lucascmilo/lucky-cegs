import Link from "next/link";
import CartaoAviso from "@/componentes/CartaoAviso";
import folhaContato from "@/public/imagens/folha-contato-2.png";
import mosaicoPixels from "@/public/imagens/mosaico-pixels.png";

// === Seção: Caixa não encontrada ===
// Fica dentro do layout do site (o cabeçalho já carregou), por isso não repete a estrutura.
export default function CaixaNaoEncontrada() {
  return (
    <CartaoAviso
      etiqueta="CAIXA NÃO ENCONTRADA"
      tituloPreto="ESSA CAIXA"
      tituloRosa="NÃO EXISTE"
      cursiva="talvez ela tenha mudado de número…"
      texto="Confira o link ou volte para as caixas abertas."
      peca={folhaContato}
      imagemSelo={mosaicoPixels}
    >
      <Link href="/caixas" className="botao botao__rosa">
        Ver caixas abertas
      </Link>
      <Link href="/" className="botao botao__contorno">
        Voltar para o início
      </Link>
    </CartaoAviso>
  );
}