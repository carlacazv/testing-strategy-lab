import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mutants } from '../mutation/catalog.mjs';

const layerCommands = {
  static: 'test:static',
  unit: 'test:unit',
  component: 'test:component',
  integrationSmoke: 'test:integration:smoke',
  integrationFull: 'test:integration',
  e2eSmoke: 'test:e2e:smoke',
  e2eAuth: 'test:e2e:auth',
  accessibility: 'test:a11y',
};

const options = new Map();
for (const arg of process.argv.slice(2)) {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  options.set(key, value);
}

const csv = (name) => options.has(name)
  ? options.get(name).split(',').map((value) => value.trim()).filter(Boolean)
  : null;

const requestedIds = csv('ids');
const requestedLayers = csv('layers');
const requireKill = options.get('require-kill') === 'true';

const selectedMutants = requestedIds
  ? mutants.filter((mutant) => requestedIds.includes(mutant.id))
  : mutants;

if (requestedIds) {
  const missing = requestedIds.filter((id) => !selectedMutants.some((mutant) => mutant.id === id));
  if (missing.length) throw new Error(`Unknown mutant ids: ${missing.join(', ')}`);
}

const selectedLayers = requestedLayers || Object.keys(layerCommands);
const unknownLayers = selectedLayers.filter((layer) => !layerCommands[layer]);
if (unknownLayers.length) throw new Error(`Unknown mutation layers: ${unknownLayers.join(', ')}`);

function targetFile(mutant) {
  if (mutant.target === 'lab') return resolve(mutant.path);
  if (mutant.target === 'sut') return resolve('.sut/conduit', mutant.path);
  throw new Error(`Mutant ${mutant.id} has unsupported target: ${mutant.target}`);
}

mkdirSync('reports/mutation', { recursive: true });
const results = [];
let unmetRequiredKill = false;

for (const mutant of selectedMutants) {
  const file = targetFile(mutant);
  const original = readFileSync(file, 'utf8');
  if (!original.includes(mutant.from)) {
    throw new Error(`Mutant ${mutant.id} cannot find expected source text in ${mutant.path}`);
  }

  writeFileSync(file, original.replace(mutant.from, mutant.to));
  const detections = {};

  try {
    console.log(`\n=== mutant: ${mutant.id} ===`);
    for (const layer of selectedLayers) {
      const command = layerCommands[layer];
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
      console.log(`${layer.padEnd(18)} ${run.status !== 0 ? 'KILLED' : 'survived'}`);
    }
  } finally {
    writeFileSync(file, original);
  }

  const killedBySelectedLayer = Object.values(detections).some((detection) => detection.killed);
  if (requireKill && !killedBySelectedLayer) unmetRequiredKill = true;
  results.push({ ...mutant, detections });
}

const payload = {
  generatedAt: new Date().toISOString(),
  sutCommit: '5e127d8569b300e0a21dc2c20ea680da4967b1aa',
  selectedLayers,
  mutants: results,
};
writeFileSync('reports/mutation/results.json', JSON.stringify(payload, null, 2));

const pretty = {
  static: 'Static',
  unit: 'Unit',
  component: 'Component',
  integrationSmoke: 'Integration smoke',
  integrationFull: 'Integration full',
  e2eSmoke: 'E2E smoke',
  e2eAuth: 'E2E auth',
  accessibility: 'Accessibility',
};
const header = `| Mutant | ${selectedLayers.map((layer) => pretty[layer]).join(' | ')} |\n|---|${selectedLayers.map(() => '---:').join('|')}|\n`;
const rows = results.map((item) => {
  const cells = selectedLayers.map((layer) => item.detections[layer]?.killed ? '✅' : '—');
  return `| ${item.id} | ${cells.join(' | ')} |`;
}).join('\n');
writeFileSync('reports/mutation/results.md', `# Mutation matrix\n\n${header}${rows}\n`);
console.log('\nMutation evidence: reports/mutation/results.json');

if (unmetRequiredKill) {
  console.error('At least one selected mutant survived every selected layer while --require-kill=true.');
  process.exitCode = 1;
}
