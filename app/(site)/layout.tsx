import EstruturaSite from "@/componentes/EstruturaSite";

// === Seção: Layout das páginas do site ===
export default function LayoutSite({ children }: LayoutProps<"/">) {
  return <EstruturaSite>{children}</EstruturaSite>;
}
