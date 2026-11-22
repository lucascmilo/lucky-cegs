import Link from "next/link";
import CartaoAviso from "@/componentes/CartaoAviso";

// === Seção: Caixa não encontrada ===
// Fica dentro do layout do site (o cabeçalho já carregou), por isso não repete a estrutura.
export default function CaixaNaoEncontrada() {
  return (
    <CartaoAviso
      selo="?"
      etiqueta="CAIXA NÃO ENCONTRADA"
      tituloPreto="ESSA CAIXA"
      tituloRosa="NÃO EXISTE"
      cursiva="talvez ela tenha mudado de número…"
      texto="Confira o link ou volte para as caixas abertas."
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
