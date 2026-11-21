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
| `app/(site)/` | Páginas com barra superior, cabeçalho e rodapé (início, Termos, carregando e erro) |
| `app/(site)/_inicio/` | Partes da tela inicial (hero, ações do visitante e do joiner, seções do joiner) |
| `app/(site)/caixas/` | Tela de caixas do joiner (`_caixa/` tem as partes: faixa, sets, pedidos individuais, foto com lupa) |
| `app/not-found.tsx` | Página não encontrada (404) |
| `app/(acesso)/` | Telas de Entrar e Criar conta (colagem + cartão-postal) |
| `app/api/` | Rotas do Better Auth e da assinatura de upload do Cloudinary |
| `componentes/` | Componentes compartilhados (estrutura do site, cabeçalho, rodapé, player, cartão de aviso, ícones…) |
| `estilos/` | CSS: `globais.css`, `componentes/` e `paginas/` |
| `lib/` | Autenticação, sessão, navegação, dados do joiner, etapas, formatação, player de música e dados fixos da loja |
| `db/` e `auth-schema.ts` | Conexão e tabelas (Drizzle) |
| `proxy.ts` | Redireciona quem já está logado para fora de Entrar/Criar conta |
| `public/imagens/`, `public/musicas/` | Imagens do protótipo e músicas do player |

## Convenções

- **Tudo em português**: rotas, arquivos, componentes, funções, variáveis e classes CSS.
- **CSS sem Tailwind e sem CSS Modules**: cada componente importa o seu arquivo de `estilos/`.
  Como as classes são globais, todas levam o nome do componente como prefixo
  (`cabecalho__logo`, `painelColagem__modelo`). Para juntar classes condicionais, use
  `juntarClasses` (`lib/classes.ts`). Classes comuns ficam em `globais.css`: `.botao`
  (`botao__rosa`, `botao__preto`, `botao__contorno`), `.envelopeCorreio`, `.fundoPontosRosa` e `.esqueleto`.
- **Comentários de seção** no topo de cada bloco, em TSX e CSS
  (`{/* === Seção: Cabeçalho === */}`, `/* === Seção: Cabeçalho === */`).
- **Escala das telas** (protótipo de 1440 px): as telas encolhem com as variáveis `--px-hero` (tela inicial), `--px-faixa` (Termos),
  `--px-palco` (colagem das telas de acesso) e `--px-cartao` (cartão das telas de acesso).
- **Telas grandes**: acima de 1680 px o site inteiro é ampliado (`zoom` em `globais.css`).
  Para medidas da altura/largura da tela, use `--altura-tela` e `--largura-tela` (já descontam o zoom).
- **Endereço guarda o estado**: na tela de caixa, filtro, busca e "Ver mais" ficam no endereço (`?filtro=meus&busca=…&mostrar=8`).
- **Login**: páginas que exigem login usam `exigirUsuario` (`lib/sessao.ts`), que manda para `/entrar?voltar=…`.
- **Selo "novo"**: compara quando a etapa mudou (`situacao_atualizada_em`) com a última visita à caixa, guardada no navegador.
  Ao mudar a etapa de uma caixa ou item, atualize também `situacao_atualizada_em`.
- **Música**: o áudio é único para o site (`lib/reprodutorMusica.ts`); o player só o controla.
- **Termos**: o texto das regras fica em `app/(site)/termos/conteudoTermos.tsx`.
- **Segurança**: toda ação da GOM confere `role === "admin"` no servidor.
