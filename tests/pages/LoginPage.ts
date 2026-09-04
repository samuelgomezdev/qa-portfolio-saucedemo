import type { Page, Locator } from '@playwright/test';

/** Tela de autenticação do Swag Labs. */
export class LoginPage {
  readonly erro: Locator;

  constructor(private readonly page: Page) {
    this.erro = page.locator('[data-test="error"]');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/');
  }

  async login(usuario: string, senha: string): Promise<void> {
    await this.page.locator('#user-name').fill(usuario);
    await this.page.locator('#password').fill(senha);
    await this.page.locator('#login-button').click();
  }

  botaoLogin(): Locator {
    return this.page.locator('#login-button');
  }
}
