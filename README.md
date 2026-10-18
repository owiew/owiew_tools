# owiew tools

[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-4338ca.svg)](LICENSE)
[![CI](https://github.com/owiew/owiew_tools/actions/workflows/ci.yml/badge.svg)](https://github.com/owiew/owiew_tools/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-24%20LTS-4338ca)

Ferramentas gratuitas e de código aberto para quem trabalha com tráfego pago: gerador de UTM, inspetor de URL,
calculadora de ROAS e mais a caminho. Site: **https://tools.owiew.com** (`/pt-br/`, `/en/`, `/es/`).

**Tudo roda no navegador.** Não há backend, não há conta e nada do que a pessoa digita sai da máquina. A página
declara uma Content-Security-Policy com `connect-src 'self'` e os testes e2e provam que nenhuma requisição vai
para terceiros.

## Ferramentas

| Ferramenta | Categoria | O que faz |
|---|---|---|
| Gerador de UTM | Links e UTM | Padrão de nomenclatura configurável (minúsculas, sem acento, separador), salvar padrão, lote por colagem ou CSV, exportação CSV protegida contra CSV injection |
| Inspetor de URL | Links e UTM | Quebra parâmetros, aponta UTM duplicada, conflitante, maiúscula ou com espaço, identifica `gclid`, `fbclid`, `ttclid`, `msclkid`, `wbraid`, `gbraid`, codifica e decodifica |
| Calculadora de ROAS | Calculadoras | ROAS, ROAS de equilíbrio (1 ÷ margem), margem de contribuição e lucro, com dinheiro em centavos inteiros |

Cada ferramenta tem uma página própria por idioma, com texto de apoio (como usar, fórmula, exemplos, perguntas
frequentes) e dados estruturados (`WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`).

## Como rodar

Requer **Node 24 (LTS)**; o `.nvmrc` fixa a versão.

```bash
nvm use                 # ou instale o Node 24
npm ci                  # instala a partir do lockfile
npm run dev -w @owiew/site     # site em http://localhost:4321
```

Comandos úteis (todos na raiz):

| Comando | O que faz |
|---|---|
| `npm run verify` | lint, tipos, testes com cobertura, `check:tools`, build, emoji e sitemap |
| `npm test` | testes do `packages/core` (Vitest + fast-check) |
| `npm run test:coverage` | idem, falha abaixo de 80% de cobertura |
| `npm run build` | gera OG, páginas e `sitemap.xml` em `apps/site/dist` |
| `npm run test:e2e` | Playwright: axe (WCAG 2.2 AA), SEO, JSON-LD, fluxos das ferramentas, 360px e desktop |
| `npm run lhci` | Lighthouse CI com budget (LCP, CLS, TBT em mobile) |
| `npm run check:tools` | valida o registro de ferramentas (3 idiomas, FAQ, slugs, ícones) |

Os testes e2e e o Lighthouse precisam de um Chrome: `npx playwright install chromium`, ou aponte
`CHROME_PATH` para um Chrome/Chromium instalado.

## Arquitetura

```
owiew_tools/
  packages/core/        lógica pura em TypeScript, sem DOM (Vitest + fast-check, cobertura >= 80%)
    src/money/          parse e formatação de dinheiro em centavos inteiros, aritmética BigInt
    src/utm/            normalização, montagem de URL, lote
    src/url/            leitura segura de URL, inspetor, codec, identificadores de clique
    src/csv/            parse e serialização com proteção contra CSV injection
    src/roas/           cálculo de ROAS e lucro
  apps/site/            Astro estático (ilhas Preact só onde há estado)
    tools/<id>/         UMA PASTA POR FERRAMENTA (metadados, conteúdo, UI, textos)
    src/                layout, componentes, i18n, registro, JSON-LD
    scripts/            OG por template, sitemap, inventário
    tests/              Playwright (axe, SEO, fluxos)
  scripts/              checks de repositório (ferramentas, emoji, sitemap)
  docs/                 criar-ferramenta.md
  deploy/               trecho de Caddy com cabeçalhos de segurança
```

Decisões:

- **Estático e sem backend.** O build gera HTML; o JavaScript só hidrata as ilhas de ferramenta. Bom para SEO,
  Core Web Vitals e privacidade.
- **Lógica no `core`, UI no `site`.** O `core` não conhece DOM nem Astro e é testado em isolamento. Dinheiro é
  inteiro em centavos; o arredondamento usa BigInt.
- **Uma pasta por ferramenta, registro por glob.** O site descobre `apps/site/tools/*/tool.json`. Adicionar uma
  ferramenta não edita nenhum arquivo compartilhado, então várias pessoas trabalham em paralelo sem conflito.
- **i18n por subcaminho** (`/pt-br/`, `/en/`, `/es/`) com `hreflang` recíproco, `x-default`, canonical e
  metadados próprios por idioma. A raiz `/` redireciona por HTML estático.
- **Sitemap e OG gerados no build** a partir do inventário de ferramentas (nada à mão).

## Como contribuir

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) e o guia [docs/criar-ferramenta.md](docs/criar-ferramenta.md).
Em resumo: crie a pasta `apps/site/tools/<id>/`, escreva a lógica no `packages/core` com testes, rode
`npm run verify` e `npm run test:e2e`, e abra o PR.

## Segurança

Veja [SECURITY.md](SECURITY.md). Falhas: security@owiew.com.

## Licença

[MIT](LICENSE) &copy; 2026 Adventury LTDA. Feito por [owiew](https://owiew.com/?ref=tools-readme).
