import type { PessoaItem } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import type { EstadoPagamento } from "@/lib/detalheItem";
import { obterEtapaItem, type EtapaItem } from "@/lib/etapas";
import { formatarReais } from "@/lib/formatacao";
import { IconeCheck, IconeCoracao, IconeRelogio } from "./Icones";
import "@/estilos/componentes/PecasItem.css";

// === Seção: Etiqueta "MEU" ===
export function EtiquetaMeu({ className }: { className?: string }) {
  return (
    <span className={juntarClasses("etiquetaMeu", className)}>
      <IconeCoracao className="etiquetaMeu__coracao" />
      MEU
    </span>
  );
}

// === Seção: Pílula da etapa do item ===
export function PilulaEtapa({ situacao, className }: { situacao: EtapaItem; className?: string }) {
  const etapa = obterEtapaItem(situacao);
  return (
    <span className={juntarClasses("pilulaEtapa", className)} style={{ backgroundColor: etapa.cor }}>
      {etapa.rotulo}
    </span>
  );
}

// === Seção: Nome e @ da pessoa ===
export function NomePessoa({ pessoa }: { pessoa: Pick<PessoaItem, "nome" | "user"> }) {
  return (
    <span className="nomePessoa">
      <strong>{pessoa.nome}</strong> <span className="nomePessoa__user">@{pessoa.user}</span>
    </span>
  );
}

// === Seção: Selo de pagamento ===
export function SeloPagamento({ estado }: { estado: EstadoPagamento }) {
  if (estado === "pago") {
    return (
      <span className="valorPagamento__selo valorPagamento__pago">
        <IconeCheck />
        Pago
      </span>
    );
  }
  return (
    <span className={juntarClasses("valorPagamento__selo", estado === "emBreve" ? "valorPagamento__emBreve" : "valorPagamento__pendente")}>
      <IconeRelogio />
      {estado === "emBreve" ? "Em breve" : "Pendente"}
    </span>
  );
}

// === Seção: Valor com situação de pagamento ===
// Valor vazio = "a definir": mostra "-" e fica pendente (ou "Em breve", no caso da taxa)
export function ValorPagamento({ valor, estado }: { valor: number | string | null; estado: EstadoPagamento }) {
  return (
    <span className="valorPagamento">
      <span className="valorPagamento__numero">{valor === null ? "-" : typeof valor === "string" ? valor : formatarReais(valor)}</span>
      <SeloPagamento estado={estado} />
    </span>
  );
}
