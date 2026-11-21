# Lucky Cegs

Site para organizar CEGs (compras em grupo) de photocards, álbuns e cacarecos.
Next.js (App Router) + TypeScript, Neon (Postgres) com Drizzle, Better Auth e Cloudinary.

## Como rodar

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

O arquivo `.env` precisa de: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_KEY`
e `CLOUDINARY_API_SECRET`.

Depois de alterar `db/schema.ts`, aplique no banco com `npx drizzle-kit push`.

## Estrutura

| Pasta / arquivo | O que tem |
|---|---|
| `app/(site)/` | Páginas com barra superior, cabeçalho e rodapé (tela inicial) |
| `app/(acesso)/` | Telas de Entrar e Criar conta (colagem + cartão-postal) |
| `app/api/` | Rotas do Better Auth e da assinatura de upload do Cloudinary |
| `componentes/` | Componentes compartilhados (cabeçalho, rodapé, player, ícones…) |
| `estilos/` | CSS: `globais.css`, `componentes/` e `paginas/` |
| `lib/` | Autenticação, sessão, navegação por perfil e dados fixos da loja |
| `db/` e `auth-schema.ts` | Conexão e tabelas (Drizzle) |
| `proxy.ts` | Redireciona quem já está logado para fora de Entrar/Criar conta |
| `public/imagens/`, `public/musicas/` | Imagens do protótipo e músicas do player |

## Convenções

- **Tudo em português**: rotas, arquivos, componentes, funções, variáveis e classes CSS.
- **CSS sem Tailwind e sem CSS Modules**: cada componente importa o seu arquivo de `estilos/`.
  Como as classes são globais, todas levam o nome do componente como prefixo
  (`cabecalho__logo`, `painelColagem__modelo`). Para juntar classes condicionais, use
  `juntarClasses` (`lib/classes.ts`).
- **Comentários de seção** no topo de cada bloco, em TSX e CSS
  (`{/* === Seção: Cabeçalho === */}`, `/* === Seção: Cabeçalho === */`).
- **Medidas do protótipo**: os comentários dos CSS trazem as posições originais do Figma
  (frame de 1440 px). As telas escalam a partir delas com variáveis que valem
  "1 px do protótipo": `--px-hero` (tela inicial), `--px-palco` (colagem) e
  `--px-cartao` (cartão das telas de acesso).
- **Segurança**: toda ação da GOM confere `role === "admin"` no servidor.
