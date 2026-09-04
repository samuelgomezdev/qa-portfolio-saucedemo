/**
 * Gerador de relatórios.
 *
 * Lê o resultado da suíte (via scripts/lib/results.ts) e é a ÚNICA coisa que
 * escreve em docs/. A partir do resultado de cada caso ele:
 *   - reescreve docs/03-relatorio-de-defeitos.md (as não conformidades)
 *   - reescreve docs/04-relatorio-de-execucao.md (as métricas do ciclo)
 *   - atualiza o bloco de status em docs/02-casos-de-teste.md (entre marcadores)
 *
 * Nenhum status é digitado à mão — tudo deriva da execução real.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { lerCasos, isNC, type Caso } from './lib/results';

const DIR_DOCS = resolve(process.cwd(), 'docs');
const HOJE = new Date().toISOString().slice(0, 10);

let casos: Caso[];
try {
  casos = lerCasos();
} catch {
  console.error('Não encontrei test-results/results.json. Rode "npm test" antes de "npm run report".');
  process.exit(1);
}

const ncs = casos.filter(isNC);

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

const sevs = ['Bloqueador', 'Crítico', 'Médio', 'Baixo'];
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
  execucao += `| ${m} | ${porModulo(m, (c) => c.classificacao !== 'Não executado')} | ${porModulo(m, (c) => c.classificacao === 'Aprovado')} | ${porModulo(m, isNC)} |\n`;
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

// ---------------------------------------------------------------------------
// docs/02-casos-de-teste.md — bloco de status entre marcadores.
// ---------------------------------------------------------------------------
function rotulo(c: Caso): string {
  switch (c.classificacao) {
    case 'Aprovado': return '✅ Aprovado';
    case 'NC': return '🐞 NC (defeito conhecido)';
    case 'NC-nova': return '❌ NC (regressão)';
    case 'Corrigido?': return '🔎 Verificar (passou inesperado)';
    default: return '⏭️ Não executado';
  }
}

const caminho02 = resolve(DIR_DOCS, '02-casos-de-teste.md');
try {
  const original = readFileSync(caminho02, 'utf-8');
  let tabela = `_Gerado automaticamente em ${HOJE} — ${casos.length} casos executados._\n\n`;
  tabela += '| Caso | Módulo | Status |\n|---|---|---|\n';
  for (const c of casos) tabela += `| ${c.ct} | ${c.modulo} | ${rotulo(c)} |\n`;
  const patched = original.replace(
    /<!-- STATUS:INICIO -->[\s\S]*?<!-- STATUS:FIM -->/,
    `<!-- STATUS:INICIO -->\n${tabela}<!-- STATUS:FIM -->`,
  );
  writeFileSync(caminho02, patched, 'utf-8');
} catch {
  console.warn('docs/02-casos-de-teste.md não encontrado; pulei o bloco de status.');
}

console.log(`Relatórios gerados: ${casos.length} casos, ${ncs.length} NC(s).`);
