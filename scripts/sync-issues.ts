/**
 * Sincroniza as não conformidades da última execução com as Issues do GitHub.
 *
 * Idempotente: cada NC carrega um marcador oculto no corpo (<!-- nc-id: CT-... -->).
 *   - NC nova            → cria a Issue
 *   - NC já existente     → mantém a Issue aberta (atualiza o corpo)
 *   - NC que sumiu (teste voltou a passar) → fecha a Issue com um comentário
 *
 * Usa o GITHUB_TOKEN nativo do Actions (permissões issues: write). Fora do
 * Actions (sem token) o script não faz nada — é seguro rodar localmente.
 */
import { lerCasos, isNC, type Caso } from './lib/results';

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY; // "owner/repo", provido pelo Actions

if (!TOKEN || !REPO) {
  console.log('GITHUB_TOKEN/GITHUB_REPOSITORY ausentes — sincronização de Issues ignorada (execução local).');
  process.exit(0);
}

const API = 'https://api.github.com';
const LABEL_NC = 'nao-conformidade';

interface Issue { number: number; title: string; body?: string | null; pull_request?: unknown }

async function gh<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'qa-portfolio-saucedemo-bot',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function labelSeveridade(sev: string): string {
  const mapa: Record<string, string> = {
    Bloqueador: 'sev:bloqueador',
    'Crítico': 'sev:critico',
    'Médio': 'sev:medio',
    Baixo: 'sev:baixo',
  };
  return mapa[sev] ?? 'sev:indefinida';
}

async function ensureLabel(name: string, color: string, description: string): Promise<void> {
  try {
    await gh('GET', `/repos/${REPO}/labels/${encodeURIComponent(name)}`);
  } catch {
    await gh('POST', `/repos/${REPO}/labels`, { name, color, description }).catch(() => {
      /* corrida entre workers: se já existir, ignora */
    });
  }
}

function marcador(ct: string): string {
  return `<!-- nc-id: ${ct} -->`;
}

function corpo(c: Caso): string {
  const tipo = c.classificacao === 'NC' ? 'Defeito conhecido do SUT' : 'Regressão (não catalogada)';
  return [
    marcador(c.ct),
    '',
    `**Caso de teste:** ${c.ct}`,
    `**Módulo:** ${c.modulo}`,
    `**Severidade:** ${c.severidade}`,
    `**Tipo:** ${tipo}`,
    '',
    '### Resultado obtido',
    c.resultadoObtido || '_ver evidência anexa ao run do GitHub Actions_',
    '',
    '---',
    '_Issue gerada automaticamente pela suíte E2E. Fecha sozinha quando o teste voltar a passar._',
  ].join('\n');
}

async function main(): Promise<void> {
  const ncs = lerCasos().filter(isNC);
  const ncPorCt = new Map(ncs.map((c) => [c.ct, c]));

  // Garante os rótulos usados.
  await ensureLabel(LABEL_NC, 'd73a4a', 'Não conformidade detectada por automação');
  const cores: Record<string, string> = {
    'sev:bloqueador': 'b60205',
    'sev:critico': 'd93f0b',
    'sev:medio': 'fbca04',
    'sev:baixo': '0e8a16',
    'sev:indefinida': 'cccccc',
  };
  for (const c of ncs) {
    const l = labelSeveridade(c.severidade);
    await ensureLabel(l, cores[l] ?? 'cccccc', `Severidade ${c.severidade}`);
  }

  // Issues de NC atualmente abertas.
  const abertas = await gh<Issue[]>(
    'GET',
    `/repos/${REPO}/issues?state=open&labels=${LABEL_NC}&per_page=100`,
  );
  const issuePorCt = new Map<string, Issue>();
  for (const it of abertas) {
    if (it.pull_request) continue; // /issues também traz PRs
    const m = (it.body ?? '').match(/<!-- nc-id: (CT-[A-Z]{3}-\d{3}) -->/);
    if (m) issuePorCt.set(m[1], it);
  }

  let criadas = 0;
  let fechadas = 0;

  // Cria/atualiza as NCs vigentes.
  for (const c of ncs) {
    const existente = issuePorCt.get(c.ct);
    const titulo = `NC — ${c.ct}: ${c.titulo}`;
    if (existente) {
      await gh('PATCH', `/repos/${REPO}/issues/${existente.number}`, {
        title: titulo,
        body: corpo(c),
      });
    } else {
      await gh('POST', `/repos/${REPO}/issues`, {
        title: titulo,
        body: corpo(c),
        labels: [LABEL_NC, labelSeveridade(c.severidade)],
      });
      criadas++;
    }
  }

  // Fecha Issues cujo defeito não se reproduziu mais.
  for (const [ct, issue] of issuePorCt) {
    if (!ncPorCt.has(ct)) {
      await gh('POST', `/repos/${REPO}/issues/${issue.number}/comments`, {
        body: `✅ ${ct} não reproduziu o defeito na última execução — fechando automaticamente.`,
      });
      await gh('PATCH', `/repos/${REPO}/issues/${issue.number}`, { state: 'closed' });
      fechadas++;
    }
  }

  console.log(`Sincronização de Issues: ${criadas} criada(s), ${fechadas} fechada(s), ${ncs.length} NC(s) vigente(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
