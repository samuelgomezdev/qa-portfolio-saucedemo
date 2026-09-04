import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração da automação E2E do Swag Labs (SauceDemo).
 *
 * O reporter `json` é a fonte de dados do gerador de relatórios
 * (scripts/generate-reports.ts): é a partir dele que as não
 * conformidades e as métricas de execução são escritas em docs/.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
