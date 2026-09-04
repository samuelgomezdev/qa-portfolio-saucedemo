import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';

test.describe('Catálogo', () => {
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

    await page.goto('/');
    await page.locator('#user-name').fill(USERS.problem);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory\.html/);

    const imagens = page.locator('.inventory_item_img img');
    const total = await imagens.count();

    const fontes = new Set<string>();
    for (let i = 0; i < total; i++) {
      fontes.add((await imagens.nth(i).getAttribute('src')) ?? '');
    }

    // Resultado esperado (comportamento correto): cada produto exibe uma
    // imagem distinta, logo o número de fontes únicas é igual ao de produtos.
    expect(
      fontes.size,
      `Esperado ${total} imagens distintas (uma por produto); encontrado ${fontes.size}. O problem_user exibe a mesma imagem para todos os itens.`,
    ).toBe(total);
  });
});
