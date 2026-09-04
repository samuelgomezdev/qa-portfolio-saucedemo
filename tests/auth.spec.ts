import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';

test.describe('Autenticação', () => {
  test('CT-LOG-001 — Login com credenciais válidas', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });

    await page.goto('/');
    await page.locator('#user-name').fill(USERS.standard);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#login-button').click();

    // Resultado esperado: redireciona ao catálogo com os produtos visíveis.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('CT-LOG-002 — Login com senha incorreta', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });

    await page.goto('/');
    await page.locator('#user-name').fill(USERS.standard);
    await page.locator('#password').fill('senha_errada');
    await page.locator('#login-button').click();

    // Resultado esperado: login negado, mensagem de erro e usuário na tela de login.
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
