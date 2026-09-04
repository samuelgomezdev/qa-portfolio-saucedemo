import type { Page, Locator } from '@playwright/test';

/** Fluxo de checkout: dados → resumo → conclusão. */
export class CheckoutPage {
  readonly erro: Locator;
  readonly cabecalhoConclusao: Locator;

  constructor(private readonly page: Page) {
    this.erro = page.locator('[data-test="error"]');
    this.cabecalhoConclusao = page.locator('[data-test="complete-header"]');
  }

  async preencherDados(nome: string, sobrenome: string, cep: string): Promise<void> {
    await this.page.locator('#first-name').fill(nome);
    await this.page.locator('#last-name').fill(sobrenome);
    await this.page.locator('#postal-code').fill(cep);
  }

  async continuar(): Promise<void> {
    await this.page.locator('[data-test="continue"]').click();
  }

  async finalizar(): Promise<void> {
    await this.page.locator('[data-test="finish"]').click();
  }

  async subtotal(): Promise<number> {
    return this.valor('.summary_subtotal_label');
  }

  async imposto(): Promise<number> {
    return this.valor('.summary_tax_label');
  }

  async total(): Promise<number> {
    return this.valor('.summary_total_label');
  }

  private async valor(seletor: string): Promise<number> {
    const texto = (await this.page.locator(seletor).textContent()) ?? '';
    return Number(texto.replace(/[^0-9.]/g, ''));
  }
}
