import type { TestInfo } from '@playwright/test';

export type Severidade = 'Bloqueador' | 'Crítico' | 'Médio' | 'Baixo';

export interface DadosNC {
  /** Módulo funcional do caso: Autenticação, Catálogo, Carrinho, Checkout. */
  modulo: string;
  /** Impacto técnico do defeito, caso o teste vire uma não conformidade. */
  severidade?: Severidade;
  /**
   * Marca o caso como defeito JÁ CONHECIDO do SauceDemo.
   * Use junto de `test.fail()`: a suíte permanece verde e a NC é
   * registrada uma única vez. Se o SUT for corrigido, o teste passa
   * "inesperadamente" e o pipeline sinaliza o fechamento.
   */
  defeitoConhecido?: boolean;
}

/**
 * Anexa metadados ao caso via annotations do Playwright.
 * O gerador de relatórios (scripts/generate-reports.ts) lê essas
 * annotations no JSON de resultado para montar a não conformidade.
 */
export function anotarCaso(info: TestInfo, dados: DadosNC): void {
  info.annotations.push({ type: 'modulo', description: dados.modulo });
  if (dados.severidade) {
    info.annotations.push({ type: 'severidade', description: dados.severidade });
  }
  if (dados.defeitoConhecido) {
    info.annotations.push({ type: 'defeito-conhecido', description: 'true' });
  }
}
