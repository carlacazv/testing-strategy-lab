import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mutants } from '../mutation/catalog.mjs';

const layerCommands = {
  static: 'test:static',
  unit: 'test:unit',
  component: 'test:component',
  integration: 'test:integration',
  e2eSmoke: 'test:e2e:smoke',
  e2eAuth: 'test:e2e:auth',
};

mkdirSync('reports/mutation', { recursive: true });
const results = [];

for (const mutant of mutants) {
  const file = resolve('.sut/conduit', mutant.path);
  const original = readFileSync(file, 'utf8');
  if (!original.includes(mutant.from)) {
    throw new Error(`Mutant ${mutant.id} cannot find expected source text in ${mutant.path}`);
  }

  const mutated = original.replace(mutant.from, mutant.to);
  writeFileSync(file, mutated);
  const detections = {};

  try {
    console.log(`\n=== mutant: ${mutant.id} ===`);
    for (const [layer, command] of Object.entries(layerCommands)) {
      const started = performance.now();
      const run = spawnSync('npm', ['run', command], {
        stdio: 'ignore',
        shell: process.platform === 'win32',
        env: { ...process.env, CI: process.env.CI || '1' },
      });
      detections[layer] = {
        killed: run.status !== 0,
        exitCode: run.status ?? 1,
        durationMs: Math.round(performance.now() - started),
      };
      console.log(`${layer.padEnd(12)} ${run.status !== 0 ? 'KILLED' : 'survived'}`);
    }
  } finally {
    writeFileSync(file, original);
  }

  results.push({ ...mutant, detections });
}

const payload = {
  generatedAt: new Date().toISOString(),
  sutCommit: '5e127d8569b300e0a21dc2c20ea680da4967b1aa',
  mutants: results,
};
writeFileSync('reports/mutation/results.json', JSON.stringify(payload, null, 2));

const header = '| Mutant | Static | Unit | Component | Integration | E2E smoke | E2E auth |\n|---|---:|---:|---:|---:|---:|---:|\n';
const rows = results.map((item) => {
  const cell = (name) => item.detections[name].killed ? '✅' : '—';
  return `| ${item.id} | ${cell('static')} | ${cell('unit')} | ${cell('component')} | ${cell('integration')} | ${cell('e2eSmoke')} | ${cell('e2eAuth')} |`;
}).join('\n');
writeFileSync('reports/mutation/results.md', `# Mutation matrix\n\n${header}${rows}\n`);
console.log('\nMutation evidence: reports/mutation/results.json');
