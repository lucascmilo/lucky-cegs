// === Seção: Utilitário de classes CSS ===
// Junta nomes de classe ignorando valores vazios, por exemplo:
// juntarClasses("botao", ativo && "botao__ativo", className)
export function juntarClasses(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
