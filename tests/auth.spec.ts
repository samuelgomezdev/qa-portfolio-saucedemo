import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

test.describe('Autenticação', () => {
  test('CT-LOG-001 — Login com credenciais válidas', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventory.itens).toHaveCount(6);
  });

  test('CT-LOG-002 — Login com senha incorreta', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });
    const login = new LoginPage(page);

    await login.abrir();
    await login.login(USERS.standard, 'senha_errada');

    await expect(login.erro).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('CT-LOG-003 — Login com campos obrigatórios em branco', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });
    const login = new LoginPage(page);

    await login.abrir();
    await login.botaoLogin().click();

    // Resultado esperado: erro indicando que Username é obrigatório.
    await expect(login.erro).toBeVisible();
    await expect(login.erro).toContainText('Username is required');
  });

  test('CT-LOG-004 — Login com usuário bloqueado', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });
    const login = new LoginPage(page);

    await login.abrir();
    await login.login(USERS.lockedOut, PASSWORD);

    // Resultado esperado: acesso negado, mensagem de conta bloqueada.
    await expect(login.erro).toContainText('locked out');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('CT-LOG-005 — Logout encerra a sessão', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Autenticação' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.logout();

    // Resultado esperado: volta à tela de login...
    await expect(login.botaoLogin()).toBeVisible();

    // ...e o botão voltar do navegador não restaura o catálogo.
    await page.goBack();
    await expect(login.botaoLogin()).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
