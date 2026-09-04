import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';

test.describe('Carrinho', () => {
  test('CT-CAR-001 — Adicionar produto ao carrinho', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Carrinho' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.adicionarPrimeiro();

    // Contador em 1 e botão muda para remover.
    await expect(inventory.badgeCarrinho).toHaveText('1');
    await expect(inventory.botaoRemoverPrimeiro()).toBeVisible();

    // Produto consta no carrinho.
    await inventory.abrirCarrinho();
    await expect(cart.itens).toHaveCount(1);
  });

  test('CT-CAR-002 — Remover produto do carrinho', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Carrinho' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    // Pré-condição: carrinho com um produto.
    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.adicionarPrimeiro();
    await inventory.abrirCarrinho();
    await expect(cart.itens).toHaveCount(1);

    await cart.removerPrimeiro();

    // Produto removido e contador deixa de existir.
    await expect(cart.itens).toHaveCount(0);
    await expect(cart.badgeCarrinho).toHaveCount(0);
  });
});
