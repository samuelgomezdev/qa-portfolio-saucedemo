# QA Portfolio — Swag Labs (SauceDemo)

Testes funcionais da aplicação web **Swag Labs**, um e-commerce de demonstração disponível em [saucedemo.com](https://www.saucedemo.com), com **automação E2E em Playwright + TypeScript**.

O diferencial deste repositório é a integração entre documentação e automação: os casos são executados por código e os **relatórios de defeitos e de execução são gerados a partir do resultado real da suíte** — nenhum status é digitado à mão, o que elimina divergências entre o que foi documentado e o que foi testado.

---

## Estrutura

```
qa-portfolio-saucedemo/
├── README.md
├── docs/                            relatórios (03 e 04 são GERADOS pela suíte)
│   ├── 01-plano-de-testes.md        Escopo, estratégia, critérios de entrada e saída
│   ├── 02-casos-de-teste.md         Especificação dos casos (status gerado)
│   ├── 03-relatorio-de-defeitos.md  Não conformidades (gerado)
│   └── 04-relatorio-de-execucao.md  Métricas do ciclo (gerado)
├── tests/                           automação Playwright
│   ├── pages/                       Page Objects
│   ├── support/                     usuários e helper de não conformidade
│   └── *.spec.ts                    casos por módulo
├── scripts/generate-reports.ts      lê o resultado da suíte e reescreve docs/
├── evidencias/
├── playwright.config.ts
└── package.json
```

---

## Como rodar

```bash
npm install
npx playwright install chromium
npm run test:report   # roda a suíte e regenera os relatórios em docs/
```

Os defeitos conhecidos do SauceDemo (ex.: imagens trocadas no `problem_user`) são marcados como *defeito conhecido* (`test.fail`): a suíte permanece **verde** e cada um vira uma não conformidade registrada uma única vez. Se o SUT for corrigido, o teste passa "inesperadamente" e o pipeline sinaliza.

---

## Objeto de teste

| Item | Descrição |
|---|---|
| Aplicação | Swag Labs (SauceDemo) |
| Tipo | E-commerce web |
| URL | https://www.saucedemo.com |
| Módulos cobertos | Autenticação, catálogo de produtos, carrinho, checkout |

---

## Resumo do ciclo

12 casos automatizados nos módulos de autenticação, catálogo, carrinho e checkout.
As métricas atuais (executados, aprovados, não conformidades) ficam sempre
atualizadas no relatório gerado: [`docs/04-relatorio-de-execucao.md`](docs/04-relatorio-de-execucao.md).

---

## Abordagem

Os casos foram derivados dos requisitos implícitos da aplicação e priorizados por risco: fluxos que impedem a conclusão de uma compra receberam prioridade sobre fluxos cosméticos.

As técnicas aplicadas na especificação foram **partição de equivalência** nos campos de entrada e **transição de estados** no fluxo de carrinho e checkout. A automação usa o padrão **Page Object** para separar a mecânica da página da intenção do teste.

Cada não conformidade segue um formato fixo — caso relacionado, resultado obtido, severidade e evidência — e nasce diretamente da falha do teste correspondente, sem registro manual.

---

## Autor

**Samuel Gomez da Silva** — [LinkedIn](https://www.linkedin.com/in/samuel-gomez-da-silva-a29485311) · [GitHub](https://github.com/samuelgomezdev)