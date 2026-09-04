import type { Page, Locator } from '@playwright/test';

/** Catálogo de produtos (inventory.html). */
export class InventoryPage {
  readonly itens: Locator;
  readonly nomes: Locator;
  readonly precos: Locator;
  readonly imagens: Locator;
  readonly badgeCarrinho: Locator;

  constructor(private readonly page: Page) {
    this.itens = page.locator('.inventory_item');
    this.nomes = page.locator('.inventory_item_name');
    this.precos = page.locator('.inventory_item_price');
    this.imagens = page.locator('.inventory_item_img img');
    this.badgeCarrinho = page.locator('.shopping_cart_badge');
  }

  /** valores válidos: 'az' | 'za' | 'lohi' | 'hilo' */
  async ordenarPor(opcao: string): Promise<void> {
    await this.page.locator('[data-test="product-sort-container"]').selectOption(opcao);
  }

  async adicionarPrimeiro(): Promise<void> {
    await this.page.locator('button[data-test^="add-to-cart"]').first().click();
  }

  botaoRemoverPrimeiro(): Locator {
    return this.page.locator('button[data-test^="remove"]').first();
  }

  async abrirCarrinho(): Promise<void> {
    await this.page.locator('.shopping_cart_link').click();
  }

  async logout(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
    await this.page.locator('#logout_sidebar_link').click();
  }

  /** Preços como números, na ordem em que aparecem na tela. */
  async precosNumericos(): Promise<number[]> {
    const textos = await this.precos.allTextContents();
    return textos.map((t) => Number(t.replace('$', '').trim()));
  }
}
