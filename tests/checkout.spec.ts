import { test, expect } from '@playwright/test';
import { USERS, PASSWORD } from './support/users';
import { anotarCaso } from './support/nc';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('Checkout', () => {
  test('CT-CHK-001 — Checkout com campos obrigatórios em branco', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Checkout' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.adicionarPrimeiro();
    await inventory.abrirCarrinho();
    await cart.irParaCheckout();

    // Prossegue com os campos em branco.
    await checkout.continuar();

    // Resultado esperado: fluxo interrompido com erro de campo obrigatório.
    await expect(checkout.erro).toBeVisible();
    await expect(checkout.erro).toContainText('First Name is required');
  });

  test('CT-CHK-002 — Conclusão do pedido com dados válidos', async ({ page }, info) => {
    anotarCaso(info, { modulo: 'Checkout' });
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.abrir();
    await login.login(USERS.standard, PASSWORD);
    await inventory.adicionarPrimeiro();
    await inventory.abrirCarrinho();
    await cart.irParaCheckout();
    await checkout.preencherDados('Samuel', 'Gomez', '88300-000');
    await checkout.continuar();

    // O total é a soma do subtotal com o imposto.
    const subtotal = await checkout.subtotal();
    const imposto = await checkout.imposto();
    const total = await checkout.total();
    expect(total).toBeCloseTo(subtotal + imposto, 2);

    // Após finalizar, confirmação do pedido.
    await checkout.finalizar();
    await expect(checkout.cabecalhoConclusao).toBeVisible();
    await expect(checkout.cabecalhoConclusao).toContainText('Thank you for your order');
  });
});
