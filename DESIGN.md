# Lucky Cegs — DESIGN.md

Especificação da identidade visual **Riso Rosa** para aplicar no site (Next.js App Router) e em todos os pontos de contato.
Este arquivo é a fonte da verdade: quando houver dúvida, vale o que está escrito aqui.

---

## 0. Regras de escopo (ler antes de tocar no código)

1. **Pode mudar:** cores, fontes, bordas, `border-radius`, `box-shadow`, fundos/texturas, filtros e arquivos de imagem.
2. **Não pode mudar:** textos, estrutura de layout (HTML/JSX), ordem de elementos, larguras/alturas/paddings de containers, breakpoints.
3. A única mudança de medida permitida em tipografia é a **compensação óptica** da seção 3.4, quando uma fonte é trocada.
4. O site tem **só modo claro** (`color-scheme: light`). Não criar tema escuro.
5. Toda imagem nova entra com **o mesmo nome e as mesmas proporções** do arquivo que substitui, exceto quando a tabela da seção 7 indica um nome novo.

---

## 1. Conceito

**"Sorte de propósito"**: a era *Accidentally On Purpose* + o nome *Lucky*. O acaso (colagem, foto, trevo) é organizado com método (grid, etiqueta, numeração, carimbo).

- **Símbolo:** trevo de quatro corações, **sem talo**. A folha **inferior esquerda** é o destaque.
- **Aparência:** papel bege/creme impresso em risografia de duas tintas, rosa + preto, com registro levemente deslocado. Fotos em duotone riso.
- **Ácido (`#e8f25c`)** só em detalhes pequenos: etiquetas de status, alças de seleção, uma fita. Nunca como fundo de seção.

---

## 2. Paleta — tokens CSS

Cole em `estilos/globais.css`, substituindo o primeiro bloco `:root` de cores e fontes. Os blocos `:root` de zoom e margem continuam como estão.

```css
:root {
  color-scheme: light;

  /* Núcleo (fixo) */
  --cor-rosa: #ea4f80;          /* marca. Texto só ≥ 24px (3,3:1 no creme) */
  --cor-preto: #151214;
  --cor-bege: #efebe5;
  --cor-bege-claro: #f4f1ec;
  --cor-creme: #fdf6ec;
  --cor-papel: #fbf9f6;         /* antes solto como #fbf9f6 / #fdfbf9 */
  --cor-branco: #ffffff;

  /* Rosas funcionais */
  --cor-rosa-texto: #c2185b;    /* texto rosa < 24px (5,5:1 no creme) */
  --cor-rosa-profundo: #b3154f; /* fundo com texto branco (6,7:1) */
  --cor-rosa-claro: #fad0e0;
  --cor-rosa-suave: #fde4ec;
  --cor-rosa-pontos: #f27ea4;

  /* Acentos */
  --cor-acido: #e8f25c;         /* só detalhes pequenos, texto sempre preto */
  --cor-amarelo: #ffe27a;       /* estados/avisos da UI (ex.: "na warehouse") */
  --cor-azul-colagem: #a8c8ef;  /* azul da meia-calça (antes #bed9f2) */

  /* Texto, bordas, estados */
  --cor-texto: #151214;
  --cor-texto-suave: #5e575a;   /* substitui #8a8486 (6,6:1) */
  --cor-grafite: #2a2628;
  --cor-borda-bege: #d8d2ca;    /* só divisória decorativa, nunca borda de campo */
  --cor-erro: #c8102e;          /* vermelho próprio, sempre com ícone/texto */
  --cor-ok: #dcf3d3;
  --cor-ok-texto: #2d6a1f;

  /* Compatibilidade (aliases dos tokens antigos — não usar em código novo) */
  --cor-rosa-vivo: var(--cor-rosa);
  --cor-rosa-escuro: var(--cor-rosa-texto);
  --cor-preto-suave: var(--cor-preto);
  --cor-menta: var(--cor-ok);

  /* Tipografia */
  --fonte-texto: var(--fonte-figtree), system-ui, sans-serif;
  --fonte-titulo: var(--fonte-archivo), "Arial Black", sans-serif;
  --fonte-pixel: var(--fonte-silkscreen), monospace;
  --peso-titulo: 900;
  --largura-titulo: 103%;       /* títulos do site (equivale ao Archivo Black) */
  --largura-marca: 125%;        /* só assinatura e títulos de marca */
  --largura-numero: 62%;        /* números das caixas */

  /* Superfícies */
  --borda: 2px solid var(--cor-preto);
  --raio: 0;
  --raio-pilula: 999px;
  --sombra-cartao: 4px 3px 0 var(--cor-rosa);          /* registro riso */
  --sombra-janela: 6px 5px 0 var(--cor-preto);
  --sombra-objeto: 3px 3px 0 rgba(21, 18, 20, 0.18);   /* polaroid, postal, colagem */
  --anel-foco: 0 0 0 3px rgba(234, 79, 128, 0.35);

  /* Texturas */
  --textura-ruido: url("/imagens/campo-pixels.svg");
}
```

### 2.1 Hexadecimais soltos → token

Troque todo valor fixo encontrado nos CSS das telas:

| Valor atual | Novo |
|---|---|
| `#fdfbf9`, `#fbf9f6` | `var(--cor-papel)` |
| `#fff8f0`, `#fff4e8` | `var(--cor-creme)` |
| `#fff6f9`, `#ffdee3`, `#f1cfd4` | `var(--cor-rosa-suave)` |
| `#e2dcf5` (lilás do Perfil) | `var(--cor-rosa-suave)` |
| `#bfd9f2`, `#bed9f2` | `var(--cor-azul-colagem)` |
| `#b8f0e6`, `#bdebd0`, `#dcf3d3` | `var(--cor-ok)` |
| `#5aa548`, `#2d6a1f` | `var(--cor-ok-texto)` |
| `#fff1c1` | mantém (estado "na warehouse") |
| `#f26a91`, `#ff81a3` | `var(--cor-rosa)` |
| `#8f1140`, `#8f1d47` | `var(--cor-rosa-profundo)` |
| `#e6e0d9`, `#e9e4de`, `#e7e1da` | `var(--cor-bege)` |
| `#8a8486`, `#6b6466`, `#5a5557` | `var(--cor-texto-suave)` |
| `#2a2628` | `var(--cor-grafite)` |
| `linear-gradient(180deg, #d6487a …, var(--cor-rosa-profundo))` | `var(--cor-preto)` (ver 4.3) |

### 2.2 Regras de contraste

- Texto rosa abaixo de 24px usa `--cor-rosa-texto`, nunca `--cor-rosa`.
- Texto sobre `--cor-rosa` deve ser **preto** (5,3:1). Branco só sobre `--cor-rosa-profundo`.
- Texto sobre `--cor-acido` é sempre preto (14:1).
- O erro usa cor própria e nunca depende só da cor: sempre há ícone ou texto.

---

## 3. Tipografia

São **três fontes**, todas do Google Fonts. **Não existe fonte cursiva no sistema.**

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Archivo** variável, peso 900 | títulos, números, assinatura |
| Texto | **Figtree** 400–700 | corpo, formulários, botões, frases de apoio |
| Técnica | **Silkscreen** 400/700 | micro-labels, etiquetas, números de etapa, letreiro |

### 3.1 `app/layout.tsx`

```tsx
import { Archivo, Figtree, Silkscreen } from "next/font/google";

const figtree = Figtree({ subsets: ["latin"], variable: "--fonte-figtree", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--fonte-archivo", display: "swap" });
const silkscreen = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--fonte-silkscreen", display: "swap" });

// <html className={`${figtree.variable} ${archivo.variable} ${silkscreen.variable}`}>
```

Remova `Archivo_Black`, `Pinyon_Script`, as variáveis `--fonte-archivo-black` e `--fonte-pinyon-script` e o token `--fonte-cursiva`.

### 3.2 Archivo Black → Archivo 900 (todos os usos de `--fonte-titulo`)

O Archivo Black só tem um peso. O Archivo variável precisa de peso e largura explícitos. **Em todo seletor que usa `font-family: var(--fonte-titulo)`**, aplique:

```css
font-weight: var(--peso-titulo);      /* troca o font-weight: 400 que existir */
font-stretch: var(--largura-titulo);  /* 103% */
```

Seletores (do `fontes_mapa`): `.cabecalho__logo`, `.cartaoAviso__seloNumero`, `.cartaoAviso__titulo`, `.janelaConfirmar__titulo`, `.janelaDetalhes__titulo`, `.janelaGom__titulo`, `.janelaGom__lucro`, `.janelaCaixa__prefixo`, `.janelaCaixa__sufixo`, `.janelaCaixa__numero`, `.janelaCaixa__nomePrevia`, `.rodape__marcaContorno`, `.rodape__tituloPix`, `.sino__titulo`, `.sino__vazioTitulo`, `.tituloFaixa`, `.painelColagem__titulo`, `.telaAcesso__titulo`, `.caixaTopo__titulo`, `.caixaItens__titulo`, `.cartaoSet__nome`, `.cartaoIndividual__nome`, `.caixaGom__titulo`, `.planilhaGom__linhaTotal th`, `.fichario__nomeCaixa`, `.postal__titulo`, `.postalVazio__titulo`, `.inicio__titulo`, `.inicio__faltaPagarValor`, `.inicioJoiner__titulo`, `.caixaResumo__nome`, `.inicioJoiner__vazioTitulo`, `.meusItens__titulo`, `.cartaoMeusItens__titulo`, `.andamento__nome`, `.proofsEmDia__titulo`, `.perfil__cartaoMarca`, `.perfil__avatar`, `.perfil__cartaoNome`, `.perfil__tituloLinha`, `.cartaoSemDono__nome`, `.cartaoSemDono__preco`, `.semDonoVazio__titulo`.

### 3.3 Silkscreen: grid de 8 px

A Silkscreen só fica nítida em múltiplos de 8 px de altura de "pixel": **12 (aceito em telas 2×), 16 e 24 px**. O `line-height` existente se mantém, então a altura das linhas não muda.

### 3.4 Tabela de compensação óptica

Os valores valem para desktop e mobile, porque o site já escala com `calc`/`clamp`/`max`. Aplique **só** o que está na coluna "Para"; o resto permanece.

**a) Archivo Black → Archivo 900, largura 103%**

| Seletor | font-size | line-height | letter-spacing |
|---|---|---|---|
| Todos da lista 3.2 | igual (×1,00) | igual | igual |

Medição nas fontes reais:
- altura das maiúsculas: 0,686 contra 0,688 em;
- largura dos títulos: −1,4% a +2,5% conforme as letras ("SUAS CAIXAS" +0,3%, "DO PEDIDO ATÉ VOCÊ" −1,4%, "LUCKYCEGS" +2,5%).

Se algum título em container de largura fixa ganhar uma quebra de linha nova, reduza **só esse seletor** para `font-size × 0,975` ou use `font-stretch: 100%` nele.

**b) Pinyon Script → removida** (os 6 usos atuais)

| Seletor | De | Para |
|---|---|---|
| `.telaAcesso__saudacao` | Pinyon `calc(var(--px-cartao)*38)` / lh `calc(var(--px-cartao)*40)` | `font-family: var(--fonte-pixel); font-weight: 700; font-size: calc(var(--px-cartao)*16); line-height: calc(var(--px-cartao)*40); letter-spacing: .06em; text-transform: uppercase; color: var(--cor-rosa-texto)` |
| `.caixaTopo__origem` | Pinyon `0.574em` / lh 1 | `font-family: var(--fonte-pixel); font-weight: 700; font-size: 0.255em; line-height: 1; letter-spacing: .06em; color: var(--cor-rosa-texto); vertical-align: middle` |
| `.cartaoAviso__cursiva` | Pinyon 30px / lh 1.1 | `font-family: var(--fonte-texto); font-weight: 700; font-size: 20px; line-height: 1.65; color: var(--cor-rosa-texto)` (caixa de linha 33px, igual à anterior) |
| `.postal__cursiva` | Pinyon `max(24px, var(--px-pagina)*34)` / lh 1.2 | `font-family: var(--fonte-texto); font-weight: 700; font-size: max(16px, var(--px-pagina)*22); line-height: 1.85; color: var(--cor-rosa-texto)` |
| `.casaGom__cursiva` | Pinyon `0.45em` | `font-family: var(--fonte-titulo); font-weight: 900; font-stretch: 103%; font-size: 0.38em; color: var(--cor-rosa)` |
| `.rodape__feitoCom` | Pinyon 28px / lh 1 | `font-family: var(--fonte-pixel); font-size: 12px; line-height: 28px; letter-spacing: .06em; text-transform: uppercase` |

**c) Silkscreen fora do grid → grid**

| Valor atual | Para | Ajuste |
|---|---|---|
| `font-size: 11px` | `12px` | — |
| `font-size: 13px` | `12px` | `letter-spacing: +0.02em` em relação ao atual |
| `font-size: 14px` | `12px` | `letter-spacing: +0.03em` |
| `font-size: 15px` | `16px` | `letter-spacing: -0.01em` |
| `font-size: 18px` (Termos) | `16px` | line-height atual mantido |
| `max(10px, var(--px-pagina)*12)` | `max(12px, var(--px-pagina)*12)` | — |
| `max(12px, var(--px-janela)*16)` | mantém | — |
| `24px` (`.inicioJoiner__numeroEtapa`) | mantém | — |
| `calc(var(--px-palco,1px)*14)` (letreiro) | `calc(var(--px-palco,1px)*16)` | line-height `*18` mantido |

**d) Figtree:** sem alteração.

---

## 4. Superfícies

### 4.1 Bordas e raios

- **Padrão:** `border: var(--borda)` (2px preto) e `border-radius: 0` em cartões, campos, botões, janelas, fotos, polaroids e postais.
- **`--raio-pilula`** só em selos e etiquetas de status e chips.
- **`50%`** só em avatares e bolinhas de progresso.
- Todos os `border-radius` atuais de 2px a 24px e os `calc(var(--px-*) * N)` → `0`, exceto os casos acima.
- Bordas tracejadas (`1.5px dashed`) continuam nos estados vazios e nos "recortes", agora sempre em `var(--cor-preto)`.

### 4.2 Sombras

| Atual | Novo |
|---|---|
| `0 18px 40px rgba(…,.1)` (`--sombra-cartao` antiga) e todas as sombras com desfoque (`0 12px 20px`, `0 14px 30px -10px`, `0 18px 36px -8px`, `0 18px 40px`, `0 30px 70px -20px`, `0 6px 14px -8px`, `0.398cqw …`) | `var(--sombra-cartao)` em cartões; `var(--sombra-janela)` em janelas e modais |
| `3px 3px 0 rgba(21,18,20,.18)` | `var(--sombra-objeto)` (mantém) |
| `0 0 0 3px rgba(234,79,128,.22)` (foco) | `var(--anel-foco)` |
| `filter: drop-shadow(0 10px 12px …)` em recortes | `filter: drop-shadow(4px 3px 0 var(--cor-rosa))` |
| `inset 0 -1px 0 …`, `0 1px 0 var(--cor-preto)` | mantêm |

### 4.3 Componentes

```css
/* Botão primário — sem gradiente */
.botaoPrimario { background: var(--cor-preto); color: var(--cor-creme); border: var(--borda);
  border-radius: 0; box-shadow: var(--sombra-cartao); font-weight: 700; }
.botaoPrimario:hover { background: var(--cor-grafite); }
.botaoPrimario:active { box-shadow: none; transform: translate(4px, 3px); }

/* Botão secundário */
.botaoSecundario { background: var(--cor-creme); color: var(--cor-preto); border: var(--borda); border-radius: 0; box-shadow: none; }

/* Campo */
input, select, textarea { border: var(--borda); border-radius: 0; background: var(--cor-branco); }
input:focus-visible, select:focus-visible, textarea:focus-visible { outline: none; box-shadow: var(--anel-foco); }
/* Autofill do Chrome (campos azulados no Entrar) */
input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px var(--cor-branco) inset; -webkit-text-fill-color: var(--cor-texto); }

/* Etiqueta de status */
.etiqueta { font-family: var(--fonte-pixel); font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
  border: var(--borda); padding: 4px 8px; background: var(--cor-acido); color: var(--cor-preto); }
```

Use as classes reais de cada tela (`.cartaoAviso`, `.caixaResumo` etc.). Os nomes acima são só referência de estilo.

### 4.4 Moldura de seleção (assinatura visual da interface)

Elementos em destaque (cartão selecionado, foto principal) podem receber a moldura com alças: borda 2px preta + quadrados de 10×10 px nos cantos, com fundo `--cor-acido` e borda 2px preta, deslocados 6px para fora. Não use mais de uma moldura por tela, e **nunca sobre rosto**.

---

## 5. Fundos e texturas

Todos são SVG em `public/imagens/`, com a transparência já embutida no arquivo.

| Classe sugerida | CSS | Onde |
|---|---|---|
| `.fundo-trevos-rosa` | `background: var(--cor-rosa) url("/imagens/fundo-trevos-rosa.svg") 0 0 / 120px 120px;` | seções rosa (substitui `radial-gradient` de pontos rosa) |
| `.fundo-trevos-creme` | `background: var(--cor-creme) url("/imagens/fundo-trevos-creme.svg") 0 0 / 120px 120px;` | substitui `fundo-coracoes.png` |
| `.fundo-pixels` | `background: var(--cor-bege-claro) var(--textura-ruido) 0 0 / 1440px auto;` | substitui `textura-fundo.png` |
| `.fundoHalftone` | fundo `var(--cor-creme)` e o `halftone-esvai.svg` num `::before` com `left top / cover no-repeat` e **opacidade 0,20** (ver 13.1) | hero e seções de destaque |
| espiral | `background: url("/imagens/argola.svg") left top / 40px 38px repeat-y;` | substitui `espiral-caderno.webp` (passo de 38px = espiral da H3) |

- Os pontos `radial-gradient(… rgba(255,255,255,.55) …)` sobre rosa passam para `.fundo-trevos-rosa`.
- Os quadradinhos azuis e o lilás saem.
- Nunca use dois padrões na mesma seção.

---

## 6. Fotos

**Receita riso**, já aplicada nas composições entregues (seção 7.1):
1. Luminância → autocontraste (corte de 1%) → gama 1,25.
2. Mapa duotone: preto `#151214` → rosa 80% → rosa/bege 50% → bege `#efebe5`.
3. Retícula rosa a 15°, com passo de 6px a cada 700px de largura, a 12% de intensidade (só textura).

**Regras:**
- **Nenhum filtro CSS** em foto de marca: a cor já vem no arquivo.
- **Nunca** aplicar filtro ou tratamento em fotos enviadas por joiners (proofs, itens, comprovantes).
- **Rosto livre:** nenhum trevo, texto, fita, moldura, selo ou grafismo sobre rosto, olhos ou boca, em nenhuma peça.
- Recortes (cutouts) mantêm a transparência, com contorno de adesivo creme + preto.
- Fotos secundárias em **folha de contato** usam cor natural levemente graduada (sem duotone), em tiras pretas com furos e numeração ácida.

---

## 7. Mapeamento de `public/imagens`

### 7.1 Composições fotográficas (novas, feitas do zero)

As colagens antigas **não** foram reaproveitadas: cada peça abaixo é uma composição nova da identidade Riso Rosa. Elas usam:
- a foto riso principal da H3 como âncora (hero do Início e polaroid do Entrar);
- moldura de seleção com alças, página de caderno com espiral, folha de contato em cor;
- trevo sem talo com folha de destaque, fita e etiquetas ácidas, micro-rótulos em Silkscreen.

Regras comuns:
- **Mesmo nome, mesma proporção e mesma orientação** do arquivo atual, então a troca é só substituir o arquivo em `public/imagens/`. Nenhuma medida de tela muda.
- **PNG 2×**: o arquivo tem o dobro de pixels do original. Se a tela usa `next/image` com `width`/`height` fixos, mantenha os valores atuais (1×).
- **Transparência**: os arquivos marcados "transparente" têm fundo transparente e continuam funcionando sobre o fundo atual da seção.
- **Rosto livre**: todas as 17 foram checadas automaticamente pelo estúdio. Nenhum elemento sobre rosto, olhos ou boca.

| Arquivo atual → novo (mesmo nome) | Tamanho 1× → arquivo 2× | Fundo | Onde aplicar | Composição |
|---|---|---|---|---|
| `inicio-photocard.png` | 340×340 → 680×680 | transparente | Início (joiner) | cartão creme com sombra preta (sem fundo bege), foto riso com moldura de seleção, rótulo e trevo |
| `inicio-modelo.png` | 1128×1430 → 2256×2860 | transparente | Início, colagem do hero | **foto principal riso (H3)** em página de caderno com espiral, moldura de seleção, tira de filme vertical em cor, bloco do trevo, etiqueta ácida |
| `polaroid-entrar.png` | 377×417 → 754×834 | transparente | Entrar | polaroid com a **foto principal riso**, fita ácida, legenda "LUCKY CEGS · Nº 01" |
| `entrar-modelo.png` | 1036×1260 → 2072×2520 | transparente | Entrar, painel de colagem | recorte riso com contorno de adesivo, bloco rosa com halftone, moldura de seleção abaixo do rosto, bloco do trevo |
| `criar-conta-modelo.png` | 578×1331 → 1156×2662 | transparente | Criar conta, painel de colagem | recorte riso com contorno, bloco rosa, moldura de seleção, trevo, etiqueta "LUCKY CEGS" |
| `colagem-painel-gom.png` | 1146×1420 → 2292×2840 | transparente | Painel da GOM | foto riso em página de caderno, tira de filme em cor, carimbo postal, bloco do trevo, etiqueta "PHOTOCARDS · ÁLBUNS · CACARECOS" |
| `modelo-painel-gom.png` | 340×340 → 680×680 | transparente | Painel da GOM | página creme com sombra preta (sem o quadrado rosa), foto riso, etiqueta "GOM" |
| `painel-photocard.png` | 340×340 → 680×680 | opaco | Painel (substitui o photocard de outra era) | photocard riso "Nº 02" |
| `modelo-caixas-gom.png` | 380×380 → 760×760 | transparente | Caixas da GOM | página com espiral (sem o quadrado rosa), moldura de seleção, etiqueta "JP 04" |
| `caixas-joiner-photocard.png` | 380×380 → 760×760 | opaco | Suas Caixas (joiner) | photocard riso com fita ácida **por cima** da borda superior da foto, "SUAS CAIXAS" |
| `modelo-meus-itens.png` | 380×380 → 760×760 | opaco | Meus itens | página com espiral sobre rosa, trevo |
| `modelo-gom-sem-dono.png` | 380×380 → 760×760 | opaco | Sem dono (GOM) | folha de contato 2×2 em cor com marcação ácida |
| `sem-dono-modelo.png` | 380×380 → 760×760 | opaco | Sem dono (joiner) | photocard riso com moldura de seleção, etiqueta "SEM DONO" |
| `modelo-proofs-gom.png` | 464×464 → 928×928 | transparente | Proofs (GOM) | cartão-postal inclinado com foto riso (sem rosto), carimbo postal, etiqueta "PROOFS" |
| `modelo-casa-da-gom.png` | 464×464 → 928×928 | transparente | Casa da GOM | página de caderno com espiral, moldura de seleção, fita |
| `photocard-termos.png` | 464×464 → 928×928 | transparente | Termos | photocard inclinado com sombra rosa, fita |
| `estrela-modelo.png` | 324×324 → 648×648 | transparente | Termos (troca a estrela pelo trevo) | foto riso recortada no trevo, rosto inteiro na folha superior direita, folha de destaque preta |

Para gerar de novo, ou ajustar uma peça, use a seção **Colagens do site** do estúdio (`lucky-cegs-estudio.html`): cada peça tem um botão "Baixar PNG 2×".

### 7.2 Biblioteca de peças finais (arquivos novos)

Arquivos **novos** (não substituem nada) para usar em seções, estados vazios, banners internos e decoração. Copie para `public/imagens/`. Todos em PNG 2×; "transparente" = canal alfa 100% transparente fora da peça, sem retângulo de fundo. Todas checadas pelo estúdio: rosto livre.

| Arquivo | Tamanho 1× → arquivo 2× | Fundo | Peça | Uso sugerido |
|---|---|---|---|---|
| `capa-riso.png` | 1146×1420 → 2292×2840 | opaco | Capa riso em sangria total | hero alternativo, página "Sobre" |
| `janela-selecao.png` | 1146×1420 → 2292×2840 | transparente | Janela de seleção (sem fundo bege) | colagem lateral de formulário |
| `folha-contato-1.png` | 1146×710 → 2292×1420 | opaco (tira preta) | Folha de contato, metade 1 (marcação em elipse) | faixa horizontal, topo de seção |
| `folha-contato-2.png` | 1146×710 → 2292×1420 | opaco (tira preta) | Folha de contato, metade 2 (marcações em X) | faixa horizontal, rodapé de seção |
| `adesivo-pixelado.png` | 1130×1320 → 2260×2640 | transparente | Adesivo pixelado (só o recorte, sem fita e sem logo) | ao lado de cards, estado vazio |
| `caderno-aberto.png` | 1146×1420 → 2292×2840 | transparente | Caderno aberto (sem fundo) | página "Casa da GOM", seções de texto |
| `photobook-pagina.png` | 1146×1420 → 2292×2840 | opaco | Página de photobook | painel de colagem |
| `poster-halftone.png` | 1146×1420 → 2292×2840 | opaco | Pôster de halftone (foto principal, retícula mais fina e limpa) | destaque de anúncio, banner interno |
| `polaroids-leque.png` | 1146×1420 → 2292×2840 | transparente | Polaroids em leque (mais espaçadas, fita em todas) | Entrar/Criar conta, estado vazio |
| `mosaico-pixels.png` | 1146×1420 → 2292×2840 | opaco | Mosaico de pixels (sem logo e sem barra preta) | fundo de destaque |
| `tira-cabine.png` | 600×1420 → 1200×2840 | transparente | Tira de cabine (só tira + fita) | coluna lateral estreita |
| `registro-riso.png` | 1146×1420 → 2292×2840 | opaco | Registro riso | painel de colagem |

**Cartela de adesivos, em arquivos individuais** (todos transparentes):

| Arquivo | Tamanho 1× → arquivo 2× | Peça |
|---|---|---|
| `adesivo-trevo-foto.png` | 600×600 → 1200×1200 | foto riso recortada no trevo, borda creme |
| `adesivo-coracao-foto.png` | 440×470 → 880×940 | foto riso recortada no coração |
| `adesivo-circulo-foto.png` | 420×420 → 840×840 | foto em cor recortada no círculo |
| `adesivo-recorte-pixel.png` | 350×700 → 700×1400 | recorte de corpo inteiro com contorno pixelado |
| `adesivo-trevo-rosa.png` | 240×240 → 480×480 | trevo rosa com folha de destaque preta, borda de adesivo |
| `adesivo-trevo-preto.png` | 240×240 → 480×480 | trevo preto com folha de destaque branca, borda de adesivo |
| `adesivo-lucky-cegs.png` | 300×96 → 600×192 | etiqueta ácida "LUCKY CEGS" |
| `adesivo-assinatura.png` | 340×124 → 680×248 | assinatura invertida sobre preto |

Regras: use `next/image` com `width`/`height` em 1× (metade do arquivo). Nunca sobreponha texto ou elemento da interface ao rosto. As peças opacas ficam com seu próprio fundo; as transparentes vão direto sobre o fundo da seção. Para gerar de novo, use a seção **Biblioteca final** do estúdio.

### 7.3 Assets gráficos (SVG)

| Arquivo atual | Ação | Arquivo novo em `public/imagens/` |
|---|---|---|
| `estrela-logo.png` | substituir | `logo-trevo.svg` (mesma caixa do PNG atual) |
| `fundo-coracoes.png` | substituir | `fundo-trevos-creme.svg` |
| `textura-fundo.png` | substituir | `campo-pixels.svg` (via `--textura-ruido`) |
| `brilho-amarelo.png`, `brilho-rosa.png` | **remover** (e remover os `<img>` decorativos) | — |
| `codigo-barras.png` | **manter** (decisão da GOM, ver 13.4) | — (`codigo-barras.svg` fica sem uso) |
| `carimbo-postal.png` | substituir | `carimbo-postal.svg` |
| `coracao-branco.png`, `coracao-rosa.png` | substituir | `coracao-branco.svg`, `coracao-rosa.svg` |
| `espiral-caderno.webp`, `argola.png` | substituir | `argola.svg` (tile de 40×38) · `espiral-caderno.svg` (coluna pronta) |
| — | novo, opcional | `termos-trevo-mascara.svg` (máscara CSS do trevo, se preferir recortar via CSS) |
| `cd.png`, `chaveiro.png` | manter | reexportar em 2× quando houver original |
| `adesivo-accidentally.png` | manter, restrito | só como carimbo de era, nunca junto da assinatura |

No pacote: os SVGs estão em `site/` e as composições e a biblioteca final em `site/imagens/`. Copie tudo para `public/imagens/`, substituindo os arquivos de mesmo nome.

## 8. Favicon e metadados (Next.js App Router)

Copie para `public/`: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `manifest.webmanifest`. Apague `app/favicon.ico` se existir, para não haver conflito.

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Lucky Cegs",
  description: "Organização de CEG's de sets nacionais e internacionais.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#ea4f80" };
```

- `favicon.svg` troca sozinho a folha de destaque de preta para branca em tema escuro (`prefers-color-scheme`).
- `apple-touch-icon.png` tem fundo rosa sólido, sem transparência.
- `icon-maskable-512.png` mantém o trevo dentro da zona segura de 80%.

---

## 9. Marca

**Trevo:**
- Folha inferior esquerda = destaque: **branca** sobre preto ou rosa, **preta** sobre branco, creme ou bege.
- Abaixo de 40px use a versão `trevo-mini-*` (folhas mais cheias, vão maior).
- O monocromático tem a folha de destaque em traço fino, a partir de 32px. Abaixo disso, use a folha cheia.

**Assinatura LUCKY/CEGS:**
- Archivo 900, largura 125, sem tracking.
- Entrelinha de 22% da altura das maiúsculas.
- Trevo com a mesma altura do bloco de texto; espaço entre trevo e texto de 30% dessa altura.
- Proporção do arquivo: **4,06 : 1**, sempre escalado inteiro. Alturas de uso: 84 / 64 / 56 / 40px (mínimo 40).
- Use os arquivos SVG, que têm o texto em contorno: nunca redigite.

**Cabeçalho do site:** troque `estrela-logo.png` por `logo-trevo.svg` no mesmo tamanho. O texto "LUCKYCEGS" continua em `--fonte-titulo`, conforme 3.2.

---

## 10. Redes

**Twitter/X:**
- Header 1500×500 (exportado também em 3000×1000) e avatar 400×400 (também 800).
- **Safe zones:**
  - 60px livres no topo e na base;
  - ~220×220 no canto inferior esquerdo (avatar no desktop);
  - ~200×100 no canto inferior direito (botões no mobile).
- O avatar é a foto da Seulgi em riso. É diferente do ícone da Comunidade do WhatsApp, que usa só o símbolo.

**WhatsApp (1024×1024, recorte circular feito pelo app):**
- **Comunidade:** trevo preto com destaque branco sobre rosa, com halftone suave na base.
- **Operacionais**, fundo chapado + pictograma preto:
  - Staff: bege;
  - Comprovantes: azul;
  - Warehouse: ácido;
  - Anúncios: rosa;
  - Chat: creme.
- **Caixas:**
  - fundo bege com uma etiqueta: faixa superior na cor da origem com a sigla em Silkscreen, corpo creme com o número em Archivo 900, largura 62;
  - cores das origens: **JP** rosa `#ea4f80` · **KR** azul `#a8c8ef` · **PH** ácido `#e8f25c` · **CH** preto `#151214` (sigla creme);
  - corpo do número: 44 com 1 dígito, 40 com 2, 34 com 3;
  - a sigla tem 18 e diminui sozinha acima de 2–3 caracteres;
  - origens e números novos (16+) saem do **gerador do estúdio**, nunca redesenhados à mão.

---

## 11. Proibições

- Fonte cursiva de qualquer tipo.
- Fontes fora de Archivo / Figtree / Silkscreen.
- Gradientes (inclusive no botão), glassmorphism, 3D plástico, neon, roxo-azul.
- Sombras com desfoque.
- Brilhos/estrelinhas como enfeite; emoji no lugar de ícone; ícone de biblioteca solto em quadrado arredondado.
- Ácido como fundo de seção ou com texto branco.
- Rosa `#ea4f80` em texto menor que 24px.
- Qualquer elemento sobre rosto, olhos ou boca.
- Redesenhar o trevo ou a assinatura: use os SVGs.
- Trevo com talo (versão antiga) ou com a folha de destaque em outra posição.
- Mais de um padrão de fundo por seção.
- Filtro em foto enviada por joiner.
- Tema escuro no site.

---

## 12. Checklist por arquivo CSS

| Arquivo | O que muda |
|---|---|
| `globais.css` | bloco `:root` (seção 2), `body`, `.tituloFaixa` (3.2), textura de fundo (5) |
| `componentes/Cabecalho.css` | logo-trevo.svg, `.cabecalho__logo` (3.2), borda inferior `var(--borda)` |
| `componentes/CartaoAviso.css` | títulos (3.2), `.cartaoAviso__cursiva` (3.4b), Silkscreen 11/12 → 12, sombra e raio (4) |
| `componentes/FaixaLetreiro.css` | letreiro 14 → 16 (3.4c) |
| `componentes/Janela*.css` | títulos (3.2), `--sombra-janela`, raio 0, Silkscreen (3.4c) |
| `componentes/Rodape.css` | `.rodape__feitoCom` (3.4b), títulos (3.2) |
| `componentes/SeloPedidosAbertos.css`, `Novidade.css`, `PecasItem.css` | etiqueta/selo (4.3), Silkscreen 11 → 12 |
| `componentes/PlayerMusica.css`, `Carregando.css`, `SinoNotificacoes.css` | Silkscreen 14 → 12 (3.4c), títulos (3.2) |
| `paginas/acesso/TelaAcesso.css` | `.telaAcesso__saudacao` (3.4b), campos + autofill (4.3), carimbo-postal.svg |
| `paginas/acesso/PainelColagem.css` | `.painelColagem__titulo` (3.2), composições novas (7.1), remover `drop-shadow` antigo dos recortes (as novas já trazem contorno) |
| `paginas/Inicio.css`, `InicioJoiner.css` | títulos (3.2), botão primário sem gradiente (4.3), fundos (5), composições do hero e photocards (7.1) |
| `paginas/Caixa.css`, `CaixaGom.css` | títulos (3.2), `.caixaTopo__origem` (3.4b), Silkscreen (3.4c), cartões (4) |
| `paginas/CasaDaGom.css` | `.casaGom__cursiva`, `.postal__cursiva` (3.4b), espiral (5), postal e fichário (4) |
| `paginas/MeusItens.css`, `SemDono.css`, `Proofs.css`, `Painel.css` | títulos (3.2), Silkscreen (3.4c), cartões (4), fotos (7) |
| `paginas/Perfil.css` | lilás → `--cor-rosa-suave` (2.1), títulos (3.2), Silkscreen 10 → 12 |
| `paginas/Termos.css` | Silkscreen 18 → 16 (3.4c), `estrela-modelo.png` e `photocard-termos.png` novos (7.1) |

**QA final:**
- Comparar cada tela antes/depois na mesma largura, sem nenhuma quebra de linha nova.
- Conferir contraste com as regras 2.2.
- Abrir o favicon em aba clara e escura.
- Rodar o estúdio (`lucky-cegs-estudio.html`) para gerar caixas novas e reexportar as redes.

---

## 13. Ajustes da GOM (valem por cima das seções anteriores)

Decisões tomadas pela GOM durante a troca de pele, já aplicadas no código. Em conflito com as seções 1 a 12, esta seção vence.

### 13.1 Halftone como véu, não como desenho
- `.fundoHalftone` (em `globais.css`): fundo creme e o `halftone-esvai.svg` num `::before` absoluto, `cover`, **opacidade 0,20**, atrás do conteúdo (`z-index: -1` com `isolation: isolate` na seção).
- A retícula só dá textura; nunca disputa leitura com o cartão por cima.
- Substitui os azulejos azuis (`.fundoAzulejos`) nas seções claras: "Suas caixas" no Início e "Quem falta pagar" no Painel.

### 13.2 Imagem real no lugar de ilustração em CSS
- Quando existe peça pronta na biblioteca (7.2), ela substitui o desenho montado em HTML/CSS.
- Primeiro caso: o leque de polaroids do aviso "Todas as proofs subiram" (Painel) usa `polaroids-leque.png` via `next/image`, com `width: 100%; height: auto`.
- Os spans e seletores do desenho antigo são apagados junto.

### 13.3 Selo "Pedidos abertos" removido
- O selo de estrela amarela saiu do Início, do Painel e das telas de acesso.
- `componentes/SeloPedidosAbertos.tsx` só exporta `PONTOS_ESTRELA` (a estrela de Meus itens); o CSS do selo foi apagado.

### 13.4 Código de barras continua em PNG
- `codigo-barras.png` segue em uso em todas as telas; o `codigo-barras.svg` foi apagado.

### 13.5 Colagem das telas de acesso
- O CD virou o adesivo `adesivo-trevo-preto.png`, girado 15°.
- O círculo rosa-claro virou um quadrado rosa-claro girado (77°), atrás das peças.
- Saíram o coração branco, o selo e o adesivo "accidentally".
- A polaroid é a mesma (`polaroid-entrar.png`) em Entrar e Criar conta.
- O carimbo postal do cartão fica girado −15°.

### 13.6 Photocard das colagens de hero
- Início e Painel usam a mesma posição do photocard (`.painel__photocard`, em `Inicio.css`): `left: -3.006%`, `top: 15.96%`, `width: 26.194%`.
- O código de barras saiu do hero do Início (joiner e visitante); fica só no hero do Painel, em `left: -10px`, `top: 42.098%`.

### 13.7 Escala das seções do Início (e do Painel, que reaproveita as classes)
- `.inicioJoiner__titulo` 52px (antes 62) e `.inicioJoiner__texto` 16px (antes 18).
- Botões de "Suas caixas" e da Casa da GOM com 182px de largura (antes 212).
- Lista de etapas em 15px (antes 18).
- Letreiro entre o hero e as seções em 12px.
- O Painel perdeu o tamanho próprio do título no celular e segue o mesmo título.

### 13.8 Sem círculos
- Avatares, ícones em caixa, bolinhas de estado, marcadores de etapa e botões de ícone são **quadrados** (`border-radius: 0`).
- A pílula continua só em selos, etiquetas, chips e contadores (4.1).
- Única exceção: o controle de arrastar dos sliders do player (`::-webkit-slider-thumb`, `::-moz-range-thumb`).

### 13.9 Véu sobre o fundo pixelado
- O `body` desenha um véu bege (`--veu-pixels: rgb(244 241 236 / 0.7)`) por cima do `campo-pixels.svg`, deixando os pixels mais suaves.
- Início e Painel ficam sem véu (`body:has(.inicio__hero) { --veu-pixels: transparent; }`), com os pixels na força total.

### 13.10 Áreas pequenas sem foto
- Miniaturas e espaços de foto vazios (Meus itens, postal da Casa da GOM, envio de proof, menu do celular) usam `background: var(--fundo-vazio)`: o `campo-pixels.svg` pela metade do tamanho (720px) com o mesmo véu bege de 70% de 13.9.
- Nunca o `campo-pixels.svg` no tamanho natural dentro de caixas pequenas: os blocos ficam maiores que a própria área.

### 13.11 Adesivo de trevo no lugar do CD
- Nas colagens das faixas de topo, o CD vira o `adesivo-trevo-preto.png` girado 15°, como em 13.5 (Proofs já trocado; Casa da GOM segue no Lote 6).
- O quadrado de fundo dessas colagens (`.casaGom__quadrado`) é rosa com trevos (`fundo-trevos-rosa.svg` a 60px), no lugar do azul.

### 13.12 Fundos de joiner e GOM nas colagens
- Joiner: trevos rosa (`.fundoTrevosRosa`). GOM: trevos creme (`.fundoTrevosCreme`). Vale para o quadrado da faixa de Sem dono e o círculo do estado vazio.
- As classes `.fundoAzulejos`, `.fundoPontosAzul` e `.fundoPixels` foram apagadas.

### 13.13 Botões principais das telas
- Todo botão de ação principal que tinha gradiente rosa (Entrar, Criar conta, "Quero esse") segue o `.botao__rosa`: preto, texto creme, sombra rosa deslocada, encosta na sombra ao apertar.

### 13.14 PNG nunca leva moldura
- Nenhuma imagem PNG recebe `border`, `outline`, moldura branca ou `box-shadow` de cartão. As composições e os adesivos já trazem o próprio contorno.
- Vale para fotos das faixas de topo (Caixas, Meus itens, Sem dono, Casa da GOM, Proofs), adesivos e peças da biblioteca.
- Quando um PNG transparente precisa de contraste com o fundo, o reforço vai num elemento separado por baixo dele (ex.: `.painel__envelope` sob o carimbo da colagem do Painel), nunca na imagem.

### 13.15 Contraste
- Texto e ícone sobre `--cor-rosa` são pretos (botão de câmera, fechar foto, play do player, contador do filtro ativo, selo da janela de confirmar).
- Carimbos e rótulos rosa com menos de 24px usam `--cor-rosa-texto` e opacidade 1.

### 13.16 Uma peça da biblioteca por tela
Cada tela ganha uma peça diferente da 7.2, sem repetir e sem nada por cima de rosto:

| Tela | Peça |
|---|---|
| Início | `adesivo-coracao-foto.png` |
| Painel | `adesivo-assinatura.png` |
| Caixas (joiner e GOM) | `adesivo-trevo-foto.png` |
| Meus itens | `adesivo-circulo-foto.png` (atrás da foto, rosto livre) |
| Sem dono | `adesivo-recorte-pixel.png` |
| Termos | `adesivo-pixelado.png` |
| Perfil | `adesivo-trevo-rosa.png` no cartão, `tira-cabine.png` na margem (≥ 1400px), `adesivo-lucky-cegs.png` na ficha |
| Página não encontrada | `capa-riso.png` |
| Erro | `poster-halftone.png` |
| Caixa não encontrada | `folha-contato-2.png` |
| Sem caixas | `caderno-aberto.png` |
| Postal vazio da Casa da GOM | `registro-riso.png` |
| Postal vazio dos Proofs | `photobook-pagina.png` |

- `CartaoAviso` recebe a peça pela prop `peca` e a cola na quina de cima do cartão, girada 7°.
- `CartaoPostalVazio` recebe a foto pela prop `foto` e corta pelo alto (rosto) dentro da polaroide.
- O fundo de trevos do Perfil tem um véu creme de 60% só nessa página.

### 13.17 Tela de carregamento
- Página de caderno creme (borda preta, sombra rosa, girada −3°) com a espiral `argola.svg` descendo pela esquerda.
- Dentro, uma moldura de seleção rosa-suave com as quatro alças ácidas e o trevo desenhado no próprio componente: as folhas acendem uma por vez, e a folha de destaque (baixo à esquerda) é preta.
- Sem foto, para continuar leve; o texto "CARREGANDO..." em Silkscreen continua igual.

### 13.18 Carimbos retirados
- O envelope de "Suas caixas" no Início do joiner (estado vazio) não tem mais o carimbo postal; o texto ocupa a coluna.
- O cartão-postal vazio aceita o carimbo de borracha como opcional (`carimbo?`). Proofs (nenhuma caixa na casa da GOM) ficou sem o "AGUARDANDO CAIXA"; a Casa da GOM do joiner mantém o "AGUARDANDO ENTREGA".

### 13.19 Tokens e arquivos retirados na limpeza final
- Tokens sem uso apagados de `globais.css`: `--cor-rosa-pontos`, `--cor-rosa-vivo`, `--raio`, `--largura-marca`, `--largura-numero`. Raio é sempre `0` escrito direto; a pílula continua em `--raio-pilula`.
- Arquivos apagados de `public/imagens/`: `codigo-barras.svg`, `espiral-caderno.svg`, `termos-trevo-mascara.svg`, `folha-contato-1.png`, `janela-selecao.png`, `modelo-painel-gom.png`, `mosaico-pixels.png`.
- Ícones apagados de `public/`: `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-96.png` (o `metadata` e o manifesto usam só `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192`, `icon-512` e `icon-maskable-512`).
