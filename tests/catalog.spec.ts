import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

test.describe('Catálogo', () => {
  test('CT-CAT-001 — Exibição da listagem de produtos', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Catálogo' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);

    // Resultado esperado: 6 produtos, cada um com nome, preço e imagem.
    await expect(inventory.itens).toHaveCount(6);
    await expect(inventory.nomes).toHaveCount(6);
    await expect(inventory.precos).toHaveCount(6);
    await expect(inventory.imagens).toHaveCount(6);
  });

  test('CT-CAT-002 — Ordenação de produtos por preço crescente', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Catálogo' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.ordenarPor('lohi');

    const precos = await inventory.precosNumericos();
    const ordenado = [...precos].sort((a, b) => a - b);
    expect(precos).toEqual(ordenado);
  });

  test('CT-CAT-003 — Imagens dos produtos com problem_user', async ({ page }, info) => {
    anotarCaso(info, {
      modulo: 'Catálogo',
      severidade: 'Médio',
      defeitoConhecido: true,
    });

    // Defeito conhecido do SauceDemo: o problem_user recebe a mesma
    // imagem ("sl-404") para todos os produtos. A suíte segue verde;
    // se um dia o SUT for corrigido, este teste passa e o pipeline avisa.
    test.fail();

    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.abrir();
    await login.login(USERS.problem, PASSWORD);
    await expect(page).toHaveURL(/inventory\.html/);

    const total = await inventory.imagens.count();
    const fontes = new Set<string>();
    for (let i = 0; i < total; i++) {
      fontes.add((await inventory.imagens.nth(i).getAttribute('src')) ?? '');
    }

    // Resultado esperado (comportamento correto): cada produto exibe uma
    // imagem distinta, logo o número de fontes únicas é igual ao de produtos.
    expect(
      fontes.size,
      `Esperado ${total} imagens distintas (uma por produto); encontrado ${fontes.size}. O problem_user exibe a mesma imagem para todos os itens.`,
    ).toBe(total);
  });
});
