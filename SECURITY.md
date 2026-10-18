# Política de segurança

## Como reportar uma vulnerabilidade

Escreva para **security@owiew.com** com a descrição, os passos para reproduzir e o impacto que você enxerga.
Não abra uma issue pública para falhas de segurança.

- Respondemos em até 3 dias úteis para confirmar o recebimento.
- Pedimos um prazo razoável para corrigir antes de qualquer divulgação pública.
- Damos crédito a quem reportar, se a pessoa quiser.

## Escopo

O `owiew tools` é um site estático. Toda a lógica roda no navegador de quem usa e **não há backend, banco de
dados nem conta de usuário**. Por isso o que mais nos interessa:

- XSS ou injeção de HTML a partir do que a pessoa digita ou cola nas ferramentas;
- CSV injection nos arquivos exportados;
- qualquer caminho que faça um dado digitado sair do navegador (requisição para terceiros);
- vulnerabilidades em dependências de produção que afetem o site publicado.

## Garantias do projeto

- Nenhuma ferramenta faz requisição para terceiros. A página declara uma Content-Security-Policy com
  `connect-src 'self'` e os testes e2e conferem isso.
- Dependências têm lockfile commitado, `npm audit` das de produção trava o CI em high/critical, e o
  histórico é varrido com gitleaks.
