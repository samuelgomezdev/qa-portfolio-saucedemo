import type { Page, Locator } from '@playwright/test';

/** Carrinho (cart.html). */
export class CartPage {
  readonly itens: Locator;
  readonly badgeCarrinho: Locator;

  constructor(private readonly page: Page) {
    this.itens = page.locator('.cart_item');
    this.badgeCarrinho = page.locator('.shopping_cart_badge');
  }

  async removerPrimeiro(): Promise<void> {
    await this.page.locator('button[data-test^="remove"]').first().click();
  }

  async irParaCheckout(): Promise<void> {
    await this.page.locator('[data-test="checkout"]').click();
  }
}
