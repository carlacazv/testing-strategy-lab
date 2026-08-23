import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { layers, strategies } from '../src/strategies.mjs';

const requested = process.argv[2];
const selected = requested ? { [requested]: strategies[requested] } : strategies;
if (requested && !strategies[requested]) {
  throw new Error(`Unknown strategy: ${requested}`);
}

mkdirSync('reports/benchmark', { recursive: true });
const results = [];

for (const [strategy, layerNames] of Object.entries(selected)) {
  const layerResults = [];
  const strategyStarted = performance.now();
  console.log(`\n=== ${strategy} ===`);

  for (const layerName of layerNames) {
    const layer = layers[layerName];
    const started = performance.now();
    const run = spawnSync('npm', ['run', layer.command], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, CI: process.env.CI || '1' },
    });
    const durationMs = Math.round(performance.now() - started);
    layerResults.push({ layer: layerName, category: layer.category, durationMs, exitCode: run.status ?? 1 });
    if (run.status !== 0) {
      console.error(`${strategy}/${layerName} failed`);
    }
  }

  results.push({
    strategy,
    durationMs: Math.round(performance.now() - strategyStarted),
    passed: layerResults.every((item) => item.exitCode === 0),
    layers: layerResults,
  });
}

const payload = {
  generatedAt: new Date().toISOString(),
  sutCommit: '5e127d8569b300e0a21dc2c20ea680da4967b1aa',
  results,
};
writeFileSync('reports/benchmark/results.json', JSON.stringify(payload, null, 2));
console.log('\nBenchmark evidence: reports/benchmark/results.json');

if (results.some((result) => !result.passed)) process.exitCode = 1;
