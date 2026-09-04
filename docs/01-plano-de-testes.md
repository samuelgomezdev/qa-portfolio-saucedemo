# Plano de Testes — Swag Labs

| Campo | Valor |
|---|---|
| Aplicação | Swag Labs (SauceDemo) — https://www.saucedemo.com |
| Versão | Ambiente de demonstração público |
| Responsável | Samuel Gomez da Silva |
| Data | _preencher_ |
| Ciclo | 01 |

---

## 1. Objetivo

Verificar se as funcionalidades essenciais do e-commerce Swag Labs se comportam conforme o esperado, com foco no fluxo que leva um usuário do login até a conclusão de um pedido.

---

## 2. Escopo

### 2.1 Dentro do escopo

| Módulo | Funcionalidades |
|---|---|
| Autenticação | Login com credenciais válidas e inválidas, mensagens de erro, logout |
| Catálogo | Listagem de produtos, ordenação, exibição de imagens e preços |
| Carrinho | Adicionar item, remover item, contador do carrinho, persistência |
| Checkout | Preenchimento de dados, validação de campos obrigatórios, resumo do pedido, finalização |

### 2.2 Fora do escopo

- Testes de performance e carga
- Testes de segurança (injeção, autorização entre contas)
- Testes de compatibilidade em navegadores além do definido no item 4
- Testes de acessibilidade
- Integração com meios de pagamento reais (a aplicação não processa pagamento)

---

## 3. Estratégia

O teste é **funcional, em caixa-preta**, executado a partir da interface do usuário sem acesso ao código-fonte. A execução é **automatizada com Playwright + TypeScript**, e os relatórios de defeitos e de execução são gerados a partir do resultado da suíte.

Técnicas de derivação de casos aplicadas:

| Técnica | Onde foi aplicada |
|---|---|
| Partição de equivalência | Campos de login e de checkout — classes válidas e inválidas |
| Transição de estados | Fluxo do carrinho e do checkout (vazio → com item → informações → resumo → concluído) |

---

## 4. Ambiente

| Item | Configuração |
|---|---|
| Sistema operacional | Windows 11 |
| Navegador | Google Chrome (versão _preencher_) |
| Resolução | 1920x1080 |
| Conexão | Banda larga |

### Usuários de teste disponíveis na aplicação

| Usuário | Comportamento esperado |
|---|---|
| `standard_user` | Usuário padrão, comportamento normal |
| `locked_out_user` | Conta bloqueada |
| `problem_user` | Usuário com problemas conhecidos na interface |
| `performance_glitch_user` | Usuário com lentidão de carregamento |

Senha para todos: `secret_sauce`

---

## 5. Critérios de entrada

- Aplicação acessível na URL definida
- Casos de teste especificados e revisados
- Ambiente configurado conforme item 4

## 6. Critérios de saída

- 100% dos casos de teste especificados executados
- Nenhum defeito de severidade **Bloqueador** ou **Crítico** em aberto
- Defeitos de severidade **Média** e **Baixa** registrados e classificados

---

## 7. Classificação de severidade

| Severidade | Definição |
|---|---|
| Bloqueador | Impede a execução do fluxo; não há solução alternativa |
| Crítico | Funcionalidade principal comprometida; existe solução alternativa custosa |
| Médio | Funcionalidade secundária afetada ou comportamento divergente sem impedir o fluxo |
| Baixo | Problema cosmético, textual ou de layout sem impacto funcional |

## 8. Classificação de prioridade

| Prioridade | Definição |
|---|---|
| Alta | Corrigir antes da liberação |
| Média | Corrigir na próxima iteração |
| Baixa | Corrigir quando houver disponibilidade |

---

## 9. Riscos identificados

| Risco | Impacto | Mitigação |
|---|---|---|
| Ambiente público pode ser reiniciado durante a execução | Perda de dados de sessão | Registrar evidência imediatamente após identificar o defeito |
| Ausência de documentação de requisitos formal | Divergência entre comportamento esperado e real | Basear o resultado esperado em convenções de e-commerce e registrar a premissa adotada no caso de teste |

---

## 10. Entregáveis

- Especificação de casos de teste (`02-casos-de-teste.md`)
- Relatório de defeitos (`03-relatorio-de-defeitos.md`)
- Relatório de execução (`04-relatorio-de-execucao.md`)
- Evidências em `/evidencias`