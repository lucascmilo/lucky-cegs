import Link from "next/link";

// === Seção: Convite para entrar ou criar conta (visitante) ===
export default function AcoesVisitante() {
  return (
    <div className="inicio__acoes">
      <div className="inicio__botoes">
        <Link href="/criar-conta" className="botao botao__rosa">
          Criar conta
        </Link>
        <Link href="/entrar" className="botao botao__contorno">
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}