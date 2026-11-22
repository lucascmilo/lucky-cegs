import { IconeCheck, IconeCoracao, IconeRelogio } from "@/componentes/Icones";
import type { PessoaItem } from "@/lib/caixas";
import { juntarClasses } from "@/lib/classes";
import { obterEtapaItem, type EtapaItem } from "@/lib/etapas";
import { formatarReais } from "@/lib/formatacao";

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

// === Seção: Valor com situação de pagamento ===
// Valor vazio = "a definir": mostra "-" e fica pendente
export function ValorPagamento({ valor, pago }: { valor: number | string | null; pago: boolean }) {
  return (
    <span className="valorPagamento">
      <span className="valorPagamento__numero">{valor === null ? "-" : typeof valor === "string" ? valor : formatarReais(valor)}</span>
      {pago ? (
        <span className="valorPagamento__selo valorPagamento__pago">
          <IconeCheck />
          Pago
        </span>
      ) : (
        <span className="valorPagamento__selo valorPagamento__pendente">
          <IconeRelogio />
          Pendente
        </span>
      )}
    </span>
  );
}
