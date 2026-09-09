# Casos de Teste — Swag Labs

Identificação: `CT-[MÓDULO]-[NÚMERO]`
Módulos: `LOG` autenticação · `CAT` catálogo · `CAR` carrinho · `CHK` checkout

O **status de cada caso é gerado automaticamente** pela execução da suíte
(Playwright), no bloco abaixo. A especificação (passos e resultado esperado)
é mantida à mão; o status, não.

## Situação atual

<!-- STATUS:INICIO -->
_Gerado automaticamente em 2026-09-09 — 12 casos executados._

| Caso | Módulo | Status |
|---|---|---|
| CT-CAR-001 | Carrinho | ✅ Aprovado |
| CT-CAR-002 | Carrinho | ✅ Aprovado |
| CT-CAT-001 | Catálogo | ✅ Aprovado |
| CT-CAT-002 | Catálogo | ✅ Aprovado |
| CT-CAT-003 | Catálogo | 🐞 NC (defeito conhecido) |
| CT-CHK-001 | Checkout | ✅ Aprovado |
| CT-CHK-002 | Checkout | ✅ Aprovado |
| CT-LOG-001 | Autenticação | ✅ Aprovado |
| CT-LOG-002 | Autenticação | ✅ Aprovado |
| CT-LOG-003 | Autenticação | ✅ Aprovado |
| CT-LOG-004 | Autenticação | ✅ Aprovado |
| CT-LOG-005 | Autenticação | ✅ Aprovado |
<!-- STATUS:FIM -->

---

## Módulo: Autenticação

### CT-LOG-001 — Login com credenciais válidas

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Partição de equivalência (classe válida) |
| Pré-condição | Usuário não autenticado na página inicial |

**Passos**
1. Acessar https://www.saucedemo.com
2. Informar `standard_user` no campo Username
3. Informar `secret_sauce` no campo Password
4. Clicar em Login

**Resultado esperado**
Usuário é autenticado e redirecionado para a listagem de produtos, com os produtos visíveis.

---

### CT-LOG-002 — Login com senha incorreta

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Partição de equivalência (classe inválida) |
| Pré-condição | Usuário não autenticado |

**Passos**
1. Acessar a página inicial
2. Informar `standard_user` no campo Username
3. Informar `senha_errada` no campo Password
4. Clicar em Login

**Resultado esperado**
Login é negado, mensagem de erro é exibida e o usuário permanece na tela de login. A mensagem não deve indicar qual dos dois campos está incorreto.

---

### CT-LOG-003 — Login com campos obrigatórios em branco

| Campo | Valor |
|---|---|
| Prioridade | Média |
| Técnica | Partição de equivalência (classe inválida) |

**Passos**
1. Acessar a página inicial
2. Deixar Username e Password em branco
3. Clicar em Login

**Resultado esperado**
Mensagem indicando que o campo Username é obrigatório. Nenhuma tentativa de autenticação é realizada.

---

### CT-LOG-004 — Login com usuário bloqueado

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Partição de equivalência (classe inválida) |

**Passos**
1. Acessar a página inicial
2. Informar `locked_out_user` / `secret_sauce`
3. Clicar em Login

**Resultado esperado**
Acesso negado com mensagem informando que a conta está bloqueada. O usuário não acessa o catálogo.

---

### CT-LOG-005 — Logout encerra a sessão

| Campo | Valor |
|---|---|
| Prioridade | Média |
| Técnica | Transição de estados |
| Pré-condição | Usuário autenticado |

**Passos**
1. Abrir o menu lateral
2. Clicar em Logout
3. Retornar à página anterior pelo botão voltar do navegador

**Resultado esperado**
Sessão é encerrada e o usuário retorna à tela de login. O botão voltar não restaura o acesso ao catálogo.

---

## Módulo: Catálogo

### CT-CAT-001 — Exibição da listagem de produtos

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Pré-condição | Usuário `standard_user` autenticado |

**Passos**
1. Observar a listagem de produtos

**Resultado esperado**
Todos os produtos são exibidos com nome, descrição, preço e imagem correspondente ao produto. Cada item possui botão de adicionar ao carrinho.

---

### CT-CAT-002 — Ordenação de produtos por preço crescente

| Campo | Valor |
|---|---|
| Prioridade | Média |

**Passos**
1. Abrir o seletor de ordenação
2. Selecionar a opção de preço do menor para o maior

**Resultado esperado**
A listagem é reordenada com o produto de menor preço na primeira posição e o de maior preço na última.

---

### CT-CAT-003 — Imagens dos produtos com problem_user

| Campo | Valor |
|---|---|
| Prioridade | Média |
| Pré-condição | Sessão iniciada com `problem_user` |

**Passos**
1. Autenticar com `problem_user` / `secret_sauce`
2. Comparar cada imagem exibida com o nome e descrição do produto correspondente

**Resultado esperado**
Cada produto exibe a imagem que corresponde ao seu nome e descrição.

---

## Módulo: Carrinho

### CT-CAR-001 — Adicionar produto ao carrinho

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Transição de estados |
| Pré-condição | Usuário autenticado, carrinho vazio |

**Passos**
1. Clicar em adicionar ao carrinho no primeiro produto da lista
2. Observar o contador do ícone do carrinho
3. Abrir o carrinho

**Resultado esperado**
O contador exibe 1, o botão do produto muda para remover e o produto adicionado consta no carrinho com nome, preço e quantidade corretos.

---

### CT-CAR-002 — Remover produto do carrinho

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Transição de estados |
| Pré-condição | Carrinho com um produto |

**Passos**
1. Abrir o carrinho
2. Clicar em remover no produto listado

**Resultado esperado**
O produto é removido da listagem e o contador do ícone do carrinho deixa de ser exibido.

---

## Módulo: Checkout

### CT-CHK-001 — Checkout com campos obrigatórios em branco

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Partição de equivalência (classe inválida) |
| Pré-condição | Carrinho com ao menos um produto |

**Passos**
1. Abrir o carrinho e iniciar o checkout
2. Deixar os campos de nome, sobrenome e código postal em branco
3. Prosseguir

**Resultado esperado**
O fluxo é interrompido com mensagem indicando o campo obrigatório não preenchido. O usuário permanece na mesma etapa.

---

### CT-CHK-002 — Conclusão do pedido com dados válidos

| Campo | Valor |
|---|---|
| Prioridade | Alta |
| Técnica | Transição de estados |
| Pré-condição | Carrinho com ao menos um produto |

**Passos**
1. Abrir o carrinho e iniciar o checkout
2. Preencher nome, sobrenome e código postal com dados válidos
3. Prosseguir para o resumo
4. Conferir os itens, o subtotal, o imposto e o total
5. Finalizar o pedido

**Resultado esperado**
O resumo apresenta os produtos corretos e o total equivalente à soma do subtotal com o imposto. Após finalizar, é exibida a confirmação do pedido e o carrinho é esvaziado.
