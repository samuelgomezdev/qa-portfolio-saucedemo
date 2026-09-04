# QA Portfolio — Swag Labs (SauceDemo)

Documentação de testes funcionais manuais da aplicação web **Swag Labs**, um e-commerce de demonstração disponível em [saucedemo.com](https://www.saucedemo.com).

Este repositório contém o processo completo aplicado a um ciclo de teste: planejamento, especificação de casos, execução, registro de defeitos e relatório de resultados.

---

## Estrutura

```
qa-portfolio-saucedemo/
├── README.md
├── docs/
│   ├── 01-plano-de-testes.md      Escopo, estratégia, critérios de entrada e saída
│   ├── 02-casos-de-teste.md       Casos especificados com passos e resultado esperado
│   ├── 03-relatorio-de-defeitos.md Defeitos encontrados, com severidade e evidência
│   └── 04-relatorio-de-execucao.md Resultado do ciclo e recomendação de release
└── evidencias/                     Capturas de tela referenciadas nos defeitos
```

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

| Métrica | Valor |
|---|---|
| Casos de teste especificados | 12 |
| Casos executados | 12 |
| Aprovados | — |
| Reprovados | — |
| Defeitos registrados | — |
| Bloqueadores / Críticos | — |

> Atualizar após a execução.

---

## Abordagem

Os casos foram derivados dos requisitos implícitos da aplicação e priorizados por risco: fluxos que impedem a conclusão de uma compra receberam prioridade sobre fluxos cosméticos.

As técnicas aplicadas na especificação foram **partição de equivalência** e **análise de valor limite** nos campos de entrada, e **transição de estados** no fluxo de checkout.

Cada defeito registrado segue um formato fixo — passos para reproduzir, resultado esperado, resultado obtido, severidade e evidência — de modo que qualquer pessoa consiga reproduzi-lo sem contexto adicional.

---

## Autor

**Samuel Gomez da Silva** — [LinkedIn](https://www.linkedin.com/in/samuelgomez-da-silva-a29485311) · [GitHub](https://github.com/samuelgomezdev)