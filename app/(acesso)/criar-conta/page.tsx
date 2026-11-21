import type { Metadata } from "next";
import TelaAcesso from "../TelaAcesso";
import FormularioCriarConta from "./FormularioCriarConta";

// === Seção: Metadados ===
export const metadata: Metadata = {
  title: "Criar conta · Lucky Cegs",
};

// === Seção: Página Criar conta ===
export default function PaginaCriarConta() {
  return (
    <TelaAcesso
      variante="criarConta"
      saudacao="bem-vindo"
      titulo={
        <>
          CRIAR
          <br />
          CONTA
        </>
      }
    >
      <FormularioCriarConta />
    </TelaAcesso>
  );
}
