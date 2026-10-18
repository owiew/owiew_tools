# Como criar uma ferramenta

Este guia leva uma ideia até uma página publicada com SEO, três idiomas, testes e acessibilidade. Cada ferramenta
vive numa pasta própria, então você não edita nenhum arquivo compartilhado e o seu PR não conflita com o de
outras pessoas.

## Visão geral

```
packages/core/src/<dominio>/<funcao>.ts        lógica pura (sem DOM) + <dominio>.test.ts
apps/site/tools/<id>/
  tool.json        metadados por idioma (slug, título, descrição, resumo, palavras-chave)
  content.json     como usar, fórmula, exemplos e FAQ por idioma
  strings.ts       textos da interface da ferramenta por idioma
  Ui.tsx           ilha Preact (estado, formulário, resultado)
  Page.astro       monta a ilha (3 linhas)
```

O site descobre `tools/*/tool.json` sozinho. Ao criar a pasta, a ferramenta aparece na home, na categoria, na
busca, no sitemap, no JSON-LD e ganha a imagem de compartilhamento (OG), sem registrar em lugar nenhum.

## Passo a passo

### 1. Escolha o id, a categoria e a ordem

- `id`: kebab-case, em inglês, estável (ex.: `cpa-ltv`). É o nome da pasta e o nome do arquivo OG.
- `category`: `links`, `calculators`, `ads`, `keywords` ou `utilities`.
- `order`: número da ferramenta no roteiro vezes 10 (UTM = 10, inspetor = 20, ROAS = 40). Define a ordem nas listas.

Ids reservados do roteiro inicial (use estes para as ferramentas previstas):

| # | id | categoria |
|---|---|---|
| 1 | `utm-builder` | links |
| 2 | `url-inspector` | links |
| 3 | `campaign-naming` | links |
| 4 | `roas-calculator` | calculators |
| 5 | `cpa-ltv` | calculators |
| 6 | `funnel-budget` | calculators |
| 7 | `cpm-reach` | calculators |
| 8 | `ab-test` | calculators |
| 9 | `ad-preview` | ads |
| 10 | `keyword-combiner` | keywords |
| 11 | `keyword-cleaner` | keywords |
| 12 | `whatsapp-link` | utilities |
| 13 | `qr-utm` | utilities |
| 14 | `organic-traffic` | utilities |

### 2. Escreva a lógica no `packages/core`

Crie `packages/core/src/<dominio>/<funcao>.ts` e um `packages/core/src/<dominio>/index.ts` que reexporta o que a UI
usa. A UI importa por subcaminho, `import { ... } from "@owiew/core/<dominio>"`, então **nenhum arquivo
compartilhado é editado** (o `src/index.ts` agrega só as ferramentas de referência). Dinheiro, CSV, URL e leitura
de números já existem: reuse `@owiew/core` (`parseMoneyToCents`, `formatCents`, `mulDivRound`, `serializeCsv`,
`parseHttpUrl`...).

Regras:

- Sem DOM, sem `fetch`, sem `Date.now()` escondido: receba tudo por parâmetro.
- Entrada de usuário devolve `Result` (`ok`/`fail` com código de erro estável), nunca lança exceção.
- Dinheiro em **centavos inteiros**; percentuais em **pontos-base** inteiros; use `mulDivRound` para multiplicar e
  dividir sem float. Veja `packages/core/src/roas/calc-roas.ts` como modelo.
- Comente toda função: o quê, onde é usada, entradas, saídas e o fluxo do dado.
- Teste o caminho feliz, o caminho de erro, entradas hostis (vazio, unicode, byte nulo, limites) e propriedades
  com `fast-check`. A cobertura do core precisa ficar em 80% ou mais.

### 3. Crie `tools/<id>/tool.json`

```json
{
  "id": "meu-id",
  "category": "calculators",
  "icon": "calculator",
  "order": 50,
  "related": ["roas-calculator"],
  "i18n": {
    "pt-br": { "slug": "...", "name": "...", "title": "...", "description": "...", "summary": "...", "keywords": ["..."] },
    "en":    { "...": "..." },
    "es":    { "...": "..." }
  }
}
```

- `slug`: kebab-case, **localizado** (a URL é `/<idioma>/<categoria>/<slug>/`), único na categoria.
- `title`: até 75 caracteres, com a palavra-chave principal. `description`: de 70 a 175 caracteres, útil e sem enchimento.
- `summary`: frase que aparece no topo da página e nos cartões.
- `icon`: um nome de ícone **Lucide** listado em `apps/site/src/components/ToolIcon.tsx` (já há ícones para todas as
  ferramentas do roteiro). Precisa de outro? Acrescente uma linha no fim do mapa (Lucide é ISC). **Nunca emoji.**
- `related`: ids de outras ferramentas. Ids que ainda não existem são ignorados.

### 4. Escreva `content.json`

Para cada idioma: `howTo` (nome + passos), `formula` (título, parágrafos e itens com a conta), `examples` e `faq`.

- **FAQ: no mínimo 4 perguntas reais**, do tipo que alguém digitaria no Google. Resposta direta na primeira frase.
- O JSON-LD (`HowTo`, `FAQPage`) é gerado do mesmo texto que aparece na página. Não existe texto "só para o Google".
- Fórmulas e limites de plataforma precisam bater com a documentação oficial. Cite a regra, não invente número.
- Texto útil, não enchimento: a página precisa ensinar algo que a ferramenta sozinha não ensina.

### 5. Escreva `strings.ts` e `Ui.tsx`

- `strings.ts` exporta `strings(lang)` com todos os textos da ferramenta nos 3 idiomas (siga as ferramentas de
  referência). Não coloque texto solto no `Ui.tsx`.
- `Ui.tsx` exporta por padrão um componente Preact que recebe `{ lang }`. Use os componentes de
  `src/components/ui/` (`CopyButton`, `Notice`, `downloadText`).
- Estado só quando há interação; o resto é HTML. A página já sai renderizada no build, então preencha valores de
  exemplo para o crawler enxergar um resultado.
- CSS específico da ferramenta vai em `tools/<id>/styles.css`, importado pelo `Ui.tsx` (`import "./styles.css"`),
  usando os tokens (`var(--accent)`, `var(--s-4)`...) para herdar tema claro/escuro. Não edite `global.css`.
- Antes da hidratação nada deve depender de `window` ou `localStorage`: leia o storage dentro de `useEffect`,
  sempre com `try/catch`.
- Todo campo tem `<label>`, dica ligada por `aria-describedby`, erro por campo e estados de erro e vazio
  desenhados. Alvos de toque de 44px, foco visível, nada que dependa só de cor.
- **Nada de rede.** Sem `fetch`, sem biblioteca que baixe algo, sem fonte ou script externo.

### 6. Crie `Page.astro`

```astro
---
import { type Lang } from "../../src/i18n/locales";
import MinhaFerramenta from "./Ui";

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<MinhaFerramenta client:load lang={lang} />
```

### 7. Rode tudo

```bash
npm run check:tools      # estrutura, 3 idiomas, FAQ >= 4, slugs, ícone
npm run verify           # lint, tipos, testes do core, build, emoji, sitemap
npm run test:e2e         # axe nas páginas, SEO, JSON-LD e fluxos
```

Acrescente um teste e2e do seu fluxo em `apps/site/tests/tools.spec.ts` (ou num arquivo novo
`apps/site/tests/<id>.spec.ts`, que evita conflito). Use `openHydrated(page, caminho)` para esperar a ilha
hidratar antes de digitar, e `trackExternal` para provar que nada saiu do navegador.

## Checklist de revisão

- [ ] Lógica no `core` com testes de erro, entrada hostil e property-based; cobertura >= 80%
- [ ] 3 idiomas completos, FAQ >= 4, fórmula conferida na fonte oficial
- [ ] Sem rede, sem emoji, sem segredo, sem dado real
- [ ] axe sem violação, 360px sem rolagem horizontal, teclado completo
- [ ] `npm run verify` e `npm run test:e2e` verdes
- [ ] Toda função comentada; arquivos com menos de 750 linhas
