import type { Metadata } from "next";
import TelaAcesso from "../TelaAcesso";
import FormularioEntrar from "./FormularioEntrar";

// === Seção: Metadados ===
export const metadata: Metadata = {
  title: "Entrar · Lucky Cegs",
};

// === Seção: Página Entrar ===
export default function PaginaEntrar() {
  return (
    <TelaAcesso variante="entrar" saudacao="oi de novo" titulo="ENTRAR">
      <FormularioEntrar />
    </TelaAcesso>
  );
}
