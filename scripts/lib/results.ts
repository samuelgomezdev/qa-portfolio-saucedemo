/**
 * Leitura e classificação do resultado da suíte Playwright.
 * Compartilhado pelo gerador de relatórios e pelo sincronizador de Issues,
 * para que ambos enxerguem exatamente a mesma verdade.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PwAnnotation { type: string; description?: string }
interface PwError { message?: string }
interface PwResult { status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted'; errors?: PwError[] }
interface PwTest { status: 'expected' | 'unexpected' | 'flaky' | 'skipped'; annotations?: PwAnnotation[]; results?: PwResult[] }
interface PwSpec { title: string; tests?: PwTest[] }
interface PwSuite { title?: string; specs?: PwSpec[]; suites?: PwSuite[] }
interface PwReport { suites?: PwSuite[] }

export type Classificacao = 'Aprovado' | 'NC' | 'NC-nova' | 'Corrigido?' | 'Não executado';

export interface Caso {
  ct: string;
  titulo: string;
  modulo: string;
  severidade: string;
  defeitoConhecido: boolean;
  classificacao: Classificacao;
  resultadoObtido: string;
}

function semAnsi(txt: string): string {
  return txt.replace(/\[[0-9;]*m/g, '');
}

function annot(t: PwTest, tipo: string): string | undefined {
  return t.annotations?.find((a) => a.type === tipo)?.description;
}

function coletarSpecs(suite: PwSuite, acc: PwSpec[] = []): PwSpec[] {
  for (const s of suite.specs ?? []) acc.push(s);
  for (const sub of suite.suites ?? []) coletarSpecs(sub, acc);
  return acc;
}

function classificar(spec: PwSpec): Caso | null {
  const t = spec.tests?.[0];
  if (!t) return null;

  const idMatch = spec.title.match(/^(CT-[A-Z]{3}-\d{3})/);
  const ct = idMatch ? idMatch[1] : spec.title;
  const titulo = spec.title.replace(/^CT-[A-Z]{3}-\d{3}\s*[—-]\s*/, '').trim();

  const modulo = annot(t, 'modulo') ?? '—';
  const severidade = annot(t, 'severidade') ?? '—';
  const defeitoConhecido = annot(t, 'defeito-conhecido') === 'true';

  const raw = t.results?.[t.results.length - 1]?.status ?? 'skipped';
  const outcome = t.status;
  const erro = semAnsi(t.results?.[t.results.length - 1]?.errors?.[0]?.message ?? '')
    .split('\n')[0]
    .trim();

  let classificacao: Classificacao;
  if (raw === 'skipped') {
    classificacao = 'Não executado';
  } else if (raw === 'passed') {
    classificacao = defeitoConhecido && outcome === 'unexpected' ? 'Corrigido?' : 'Aprovado';
  } else {
    classificacao = defeitoConhecido && outcome === 'expected' ? 'NC' : 'NC-nova';
  }

  return { ct, titulo, modulo, severidade, defeitoConhecido, classificacao, resultadoObtido: erro };
}

export function isNC(c: Caso): boolean {
  return c.classificacao === 'NC' || c.classificacao === 'NC-nova';
}

/** Lê o JSON do Playwright e devolve os casos classificados, ordenados por id. */
export function lerCasos(caminhoJson = resolve(process.cwd(), 'test-results/results.json')): Caso[] {
  const report = JSON.parse(readFileSync(caminhoJson, 'utf-8')) as PwReport;
  const specs = (report.suites ?? []).flatMap((s) => coletarSpecs(s));
  return specs
    .map(classificar)
    .filter((c): c is Caso => c !== null)
    .sort((a, b) => a.ct.localeCompare(b.ct));
}
