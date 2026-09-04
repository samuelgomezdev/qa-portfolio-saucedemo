/** Usuários de teste do SauceDemo. Senha única para todos. */
export const PASSWORD = 'secret_sauce';

export const USERS = {
  /** Comportamento normal. */
  standard: 'standard_user',
  /** Conta bloqueada. */
  lockedOut: 'locked_out_user',
  /** Defeitos conhecidos de interface (ex.: imagens trocadas). */
  problem: 'problem_user',
  /** Lentidão de carregamento. */
  glitch: 'performance_glitch_user',
} as const;
