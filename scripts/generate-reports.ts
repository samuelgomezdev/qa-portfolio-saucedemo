/**
 * Gerador de relatórios.
 *
 * Lê o JSON produzido pelo Playwright (test-results/results.json) e é a
 * ÚNICA coisa que escreve em docs/. A partir do resultado de cada caso ele:
 *   - reescreve docs/03-relatorio-de-defeitos.md (as não conformidades)
 *   - reescreve docs/04-relatorio-de-execucao.md (as métricas do ciclo)
 *
 * Nenhum status é digitado à mão — tudo deriva da execução real, o que
 * elimina a contradição clássica (ex.: "12 executados" com aprovados em "—").
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Tipos mínimos do JSON do Playwright que este gerador consome.
// ---------------------------------------------------------------------------
interface PwAnnotation { type: string; description?: string }
interface PwError { message?: string }
interface PwResult { status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted'; errors?: PwError[] }
interface PwTest { status: 'expected' | 'unexpected' | 'flaky' | 'skipped'; annotations?: PwAnnotation[]; results?: PwResult[] }
interface PwSpec { title: string; tests?: PwTest[] }
interface PwSuite { title?: string; specs?: PwSpec[]; suites?: PwSuite[] }
interface PwReport { suites?: PwSuite[] }

// ---------------------------------------------------------------------------
// Modelo interno de um caso já classificado.
// ---------------------------------------------------------------------------
type Classificacao = 'Aprovado' | 'NC' | 'NC-nova' | 'Corrigido?' | 'Não executado';

interface Caso {
  ct: string;              // ex.: CT-CAT-003
  titulo: string;          // título sem o prefixo do id
  modulo: string;
  severidade: string;
  defeitoConhecido: boolean;
  classificacao: Classificacao;
  resultadoObtido: string; // 1ª linha do erro, sem códigos ANSI
}

const RAIZ = process.cwd();
const CAMINHO_JSON = resolve(RAIZ, 'test-results/results.json');
const DIR_DOCS = resolve(RAIZ, 'docs');
const HOJE = new Date().toISOString().slice(0, 10);

function semAnsi(txt: string): string {
  // remove sequências de escape ANSI (cor) do stack de erro
  return txt.replace(/\[[0-9;]*m/g, '');
}

function annot(t: PwTest, tipo: string): string | undefined {
  return t.annotations?.find((a) => a.type === tipo)?.description;
}

/** Percorre a árvore de suites e devolve todos os specs achatados. */
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
    // Passou de fato. Se era defeito conhecido e passou, virou "corrigido?".
    classificacao = defeitoConhecido && outcome === 'unexpected' ? 'Corrigido?' : 'Aprovado';
  } else {
    // failed / timedOut
    classificacao = defeitoConhecido && outcome === 'expected' ? 'NC' : 'NC-nova';
  }

  return { ct, titulo, modulo, severidade, defeitoConhecido, classificacao, resultadoObtido: erro };
}

// ---------------------------------------------------------------------------
// Leitura e classificação
// ---------------------------------------------------------------------------
let report: PwReport;
try {
  report = JSON.parse(readFileSync(CAMINHO_JSON, 'utf-8')) as PwReport;
} catch {
  console.error(`Não encontrei ${CAMINHO_JSON}. Rode "npm test" antes de "npm run report".`);
  process.exit(1);
}

const specs = (report.suites ?? []).flatMap((s) => coletarSpecs(s));
const casos = specs.map(classificar).filter((c): c is Caso => c !== null)
  .sort((a, b) => a.ct.localeCompare(b.ct));

const ncs = casos.filter((c) => c.classificacao === 'NC' || c.classificacao === 'NC-nova');

// ---------------------------------------------------------------------------
// docs/03-relatorio-de-defeitos.md
// ---------------------------------------------------------------------------
function statusNC(c: Caso): string {
  return c.classificacao === 'NC' ? 'Aberto (defeito conhecido)' : 'Aberto (regressão)';
}

function idNC(c: Caso): string {
  return 'NC-' + c.ct.replace(/^CT-/, '');
}

let defeitos = `# Relatório de Defeitos — Swag Labs

> Arquivo **gerado automaticamente** por \`scripts/generate-reports.ts\`. Não editar à mão.
> Última geração: ${HOJE}

---

## Resumo

| ID | Caso | Módulo | Severidade | Status |
|---|---|---|---|---|
`;

if (ncs.length === 0) {
  defeitos += '| — | Nenhuma não conformidade registrada nesta execução | — | — | — |\n';
} else {
  for (const c of ncs) {
    defeitos += `| ${idNC(c)} | ${c.ct} | ${c.modulo} | ${c.severidade} | ${statusNC(c)} |\n`;
  }
}

defeitos += '\n---\n';

for (const c of ncs) {
  defeitos += `
## ${idNC(c)} — ${c.titulo}

| Campo | Valor |
|---|---|
| **Caso de teste** | ${c.ct} |
| **Módulo** | ${c.modulo} |
| **Severidade** | ${c.severidade} |
| **Status** | ${statusNC(c)} |
| **Detecção** | Automatizada (Playwright) |
| **Data** | ${HOJE} |

### Resultado obtido
${c.resultadoObtido || '_ver evidência anexa ao run_'}

### Evidência
Screenshot e trace anexados como artefato da execução no GitHub Actions.
`;
}

mkdirSync(DIR_DOCS, { recursive: true });
writeFileSync(resolve(DIR_DOCS, '03-relatorio-de-defeitos.md'), defeitos, 'utf-8');

// ---------------------------------------------------------------------------
// docs/04-relatorio-de-execucao.md
// ---------------------------------------------------------------------------
const executados = casos.filter((c) => c.classificacao !== 'Não executado').length;
const aprovados = casos.filter((c) => c.classificacao === 'Aprovado').length;
const reprovados = ncs.length;
const naoExecutados = casos.filter((c) => c.classificacao === 'Não executado').length;
const corrigidos = casos.filter((c) => c.classificacao === 'Corrigido?').length;

const modulos = [...new Set(casos.map((c) => c.modulo))].sort();
function porModulo(mod: string, pred: (c: Caso) => boolean): number {
  return casos.filter((c) => c.modulo === mod && pred(c)).length;
}

const sevs: string[] = ['Bloqueador', 'Crítico', 'Médio', 'Baixo'];
function porSeveridade(sev: string): number {
  return ncs.filter((c) => c.severidade === sev).length;
}

let execucao = `# Relatório de Execução — Ciclo 01

> Arquivo **gerado automaticamente** por \`scripts/generate-reports.ts\`. Não editar à mão.
> Última geração: ${HOJE}

| Campo | Valor |
|---|---|
| Aplicação | Swag Labs (SauceDemo) |
| Detecção | Automatizada (Playwright + GitHub Actions) |
| Responsável | Samuel Gomez da Silva |

---

## 1. Resultado da execução

| Métrica | Quantidade |
|---|---|
| Casos automatizados | ${casos.length} |
| Executados | ${executados} |
| Aprovados | ${aprovados} |
| Reprovados (NCs) | ${reprovados} |
| Não executados | ${naoExecutados} |
| Defeitos possivelmente corrigidos | ${corrigidos} |

### Por módulo

| Módulo | Executados | Aprovados | Reprovados |
|---|---|---|---|
`;

for (const m of modulos) {
  execucao += `| ${m} | ${porModulo(m, (c) => c.classificacao !== 'Não executado')} | ${porModulo(m, (c) => c.classificacao === 'Aprovado')} | ${porModulo(m, (c) => c.classificacao === 'NC' || c.classificacao === 'NC-nova')} |\n`;
}

execucao += `
---

## 2. Não conformidades por severidade

| Severidade | Quantidade |
|---|---|
`;
for (const s of sevs) execucao += `| ${s} | ${porSeveridade(s)} |\n`;
execucao += `| **Total** | **${ncs.length}** |\n`;

const temNova = ncs.some((c) => c.classificacao === 'NC-nova');
execucao += `
---

## 3. Conclusão

${temNova
    ? '⚠️ Há regressão nova (NC não catalogada como defeito conhecido). Recomenda-se investigar antes de liberar.'
    : 'Nenhuma regressão nova. As NCs abertas são defeitos conhecidos do SUT, já rastreados.'}
`;

writeFileSync(resolve(DIR_DOCS, '04-relatorio-de-execucao.md'), execucao, 'utf-8');

console.log(`Relatórios gerados: ${casos.length} casos, ${ncs.length} NC(s).`);
