# Como contribuir

Obrigado por querer ajudar. Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md).

## O que é bem-vindo

- Ferramentas novas para tráfego pago (veja `docs/criar-ferramenta.md`).
- Correções de fórmula ou de texto, com a fonte oficial da plataforma quando houver.
- Traduções melhores em `en` e `es`.
- Melhorias de acessibilidade, desempenho e testes.

## Antes de começar

1. Abra uma issue para ferramenta nova ou mudança grande, para alinharmos o escopo.
2. Use **Node 24** (`.nvmrc`) e instale com `npm ci`. Não altere o lockfile sem motivo.

## Regras do projeto

- **Nada sai do navegador.** Sem `fetch` para terceiros, sem analytics de terceiros, sem fonte ou script de CDN.
  A CSP bloqueia e os testes conferem.
- **Lógica em `packages/core`, sem DOM**, com teste de caminho de erro, entradas hostis (vazio, unicode, byte
  nulo, limites) e, onde couber, property-based (fast-check). Dinheiro é inteiro em centavos, nunca `float`.
- **TypeScript estrito.** Sem `any`, sem `@ts-ignore`, sem `catch {}` vazio, sem teste `.skip`.
- **Acessibilidade WCAG 2.2 AA** é piso: teclado completo, foco visível, contraste, alvos de 44px, 360px sem
  rolagem horizontal. O CI roda axe em toda página.
- **Ícones são Lucide (SVG), nunca emoji.** O CI varre o código e o HTML gerado.
- **Todo conteúdo nos 3 idiomas** (`pt-br`, `en`, `es`), com título e descrição próprios, e FAQ com pelo menos 4
  perguntas reais por ferramenta.
- **Toda função tem comentário de documentação** dizendo o que faz, onde é usada, entradas, saídas e o fluxo do
  dado. Arquivos ficam abaixo de 750 linhas, com uma responsabilidade por arquivo.
- **Dependência nova** só com nome, licença e versão verificados no registro do npm, e justificativa no PR.
- **Sem segredo, sem nome de cliente, sem dado real** em código, testes ou exemplos.

## Fluxo

```bash
git switch -c minha-ferramenta
npm run verify         # lint, tipos, testes, check:tools, build, emoji, sitemap
npm run test:e2e       # axe, SEO, JSON-LD e fluxos (precisa de Chrome)
```

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`,
`test:`). Abra o PR preenchendo o checklist do template. O CI precisa estar verde.

## Segurança

Não abra issue pública para vulnerabilidade. Veja [SECURITY.md](SECURITY.md).
